/**
 * Admin 认证工具
 *
 * 使用 PBKDF2 哈希密码 + HMAC 签名 token 的客户端认证方案。
 * 密码哈希硬编码在 admin 页面中（不可逆），token 存在 httpOnly 无法实现
 * 的静态部署场景下，用 JS-accessible cookie + HMAC 签名替代。
 */

// ---- 密码哈希（由 scripts/hash-password.js 生成） ----
// 默认密码: admin123 — 首次使用请运行 node scripts/hash-password.js 生成新的
export const DEFAULT_PASSWORD_HASH =
  'd9e7768cfe63a97b79b1fd4cc8faf298:4e619e6e032bbb8109b79f6159f98b56071f2f4cea240e99e451b01c5172001d3c679c459e17c8420d97a5205d33ad29bfb58ea557a1c2e2c42344b9b1556292';

// HMAC 签名密钥（用于 cookie token，防篡改）
// 生产环境建议通过环境变量设置
export const TOKEN_SECRET = 'xinggu-blog-admin-secret-key-2026';

// Token 有效期（毫秒）
const TOKEN_MAX_AGE = 24 * 60 * 60 * 1000; // 1 天

// 暴力破解限制
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 30 * 1000; // 30 秒

// ============================================================
// 客户端 Web Crypto API 实现
// ============================================================

/**
 * 使用 PBKDF2 验证密码
 * 在浏览器中使用 Web Crypto API
 */
export async function verifyPasswordClient(
  password: string,
  storedHash: string
): Promise<boolean> {
  try {
    const [salt, expectedHash] = storedHash.split(':');
    if (!salt || !expectedHash) return false;

    const enc = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      enc.encode(password),
      'PBKDF2',
      false,
      ['deriveBits']
    );

    const derivedBits = await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt: enc.encode(salt),
        iterations: 100000,
        hash: 'SHA-256',
      },
      keyMaterial,
      512 // 64 bytes * 8 = 512 bits
    );

    const hashArray = Array.from(new Uint8Array(derivedBits));
    const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');

    return hashHex === expectedHash;
  } catch {
    return false;
  }
}

/**
 * 创建 HMAC 签名的 token
 * 用于 cookie 防篡改
 */
export async function createToken(): Promise<string> {
  const payload = `${Date.now()}:${crypto.randomUUID()}`;
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(TOKEN_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, enc.encode(payload));
  const sigHex = Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return `${payload}:${sigHex}`;
}

/**
 * 验证 HMAC 签名的 token
 * 同时检查是否过期
 */
export async function validateToken(token: string): Promise<boolean> {
  try {
    const parts = token.split(':');
    // payload 格式: timestamp:uuid；signature 是 64 个 hex 字符
    if (parts.length < 3) return false;

    const sigHex = parts[parts.length - 1]; // 最后一段是签名
    const payload = parts.slice(0, -1).join(':'); // 前面是 payload

    // 检查签名
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      enc.encode(TOKEN_SECRET),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );
    const sigBytes = new Uint8Array(sigHex.match(/.{2}/g)!.map((b) => parseInt(b, 16)));
    const isValid = await crypto.subtle.verify('HMAC', key, sigBytes, enc.encode(payload));
    if (!isValid) return false;

    // 检查过期
    const timestamp = parseInt(payload.split(':')[0], 10);
    if (Date.now() - timestamp > TOKEN_MAX_AGE) return false;

    return true;
  } catch {
    return false;
  }
}

// ============================================================
// 暴力破解限制（内存中，页面刷新后重置 —— 对静态站点够用）
// ============================================================

let failCount = 0;
let lockoutUntil = 0;

export function checkRateLimit(): { allowed: boolean; remaining: number } {
  if (lockoutUntil > Date.now()) {
    const waitSeconds = Math.ceil((lockoutUntil - Date.now()) / 1000);
    return { allowed: false, remaining: waitSeconds };
  }
  return { allowed: true, remaining: MAX_ATTEMPTS - failCount };
}

export function recordFailedAttempt(): void {
  failCount++;
  if (failCount >= MAX_ATTEMPTS) {
    lockoutUntil = Date.now() + LOCKOUT_DURATION;
    failCount = 0;
  }
}

export function resetRateLimit(): void {
  failCount = 0;
  lockoutUntil = 0;
}
