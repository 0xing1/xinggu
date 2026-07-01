/**
 * Admin 认证工具
 *
 * 客户端密码验证方案（静态站点兼容）。
 * 密码哈希硬编码在 admin 页面中（PBKDF2 不可逆），仅用于 UI 展示控制。
 * API 端点通过环境变量 ADMIN_API_KEY 进行独立认证。
 */

// ---- 密码哈希（由 scripts/hash-password.js 生成） ----
// 首次使用请运行 node scripts/hash-password.js 生成新密码哈希
export const DEFAULT_PASSWORD_HASH =
  'd9e7768cfe63a97b79b1fd4cc8faf298:4e619e6e032bbb8109b79f6159f98b56071f2f4cea240e99e451b01c5172001d3c679c459e17c8420d97a5205d33ad29bfb58ea557a1c2e2c42344b9b1556292';

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
  } catch (e) {
    console.debug('Password verification error:', e);
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
  return { allowed: true, remaining: 5 - failCount };
}

export function recordFailedAttempt(): void {
  failCount++;
  if (failCount >= 5) {
    lockoutUntil = Date.now() + 30 * 1000;
    failCount = 0;
  }
}

export function resetRateLimit(): void {
  failCount = 0;
  lockoutUntil = 0;
}
