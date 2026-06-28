#!/usr/bin/env node

/**
 * 密码哈希生成工具
 * 用法: node scripts/hash-password.js <你的密码>
 *
 * 生成 PBKDF2 哈希，用于 Admin 面板认证。
 * 把输出的 ADMIN_PASSWORD_HASH 值复制到 .env 文件中。
 */

import crypto from 'node:crypto';

const password = process.argv[2];

if (!password) {
  console.error('❌ 请提供密码');
  console.error('用法: node scripts/hash-password.js <你的密码>');
  process.exit(1);
}

if (password.length < 6) {
  console.error('❌ 密码至少 6 个字符');
  process.exit(1);
}

const salt = crypto.randomBytes(16).toString('hex');
const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha256').toString('hex');

console.log('\n🔐 密码哈希生成成功！\n');
console.log('复制下面这行到你的 .env 文件：\n');
console.log(`ADMIN_PASSWORD_HASH=${salt}:${hash}`);
console.log('\n⚠️  不要分享这个哈希值。\n');
