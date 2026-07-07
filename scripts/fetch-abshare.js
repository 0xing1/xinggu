import fs from 'fs';
import path from 'path';
import https from 'https';

const SUB_URL = 'https://PHm75i.absslk.xyz/b2836928fabd17d44993211e933b5c5a';

function httpsGet(url) {
  return new Promise((resolve, reject) => {
    https
      .get(
        url,
        {
          headers: {
            'User-Agent': 'Mozilla/5.0',
            Accept: '*/*',
          },
        },
        (res) => {
          if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
            return httpsGet(res.headers.location).then(resolve, reject);
          }
          if (res.statusCode !== 200) {
            return reject(new Error(`HTTP ${res.statusCode}`));
          }
          const chunks = [];
          res.on('data', (chunk) => chunks.push(chunk));
          res.on('end', () => resolve(Buffer.concat(chunks).toString()));
          res.on('error', reject);
        }
      )
      .on('error', reject);
  });
}

async function fetchWithRetry(url, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      return await httpsGet(url);
    } catch (err) {
      if (i < retries - 1) {
        await new Promise((r) => setTimeout(r, 2000 * (i + 1)));
      } else {
        throw err;
      }
    }
  }
}

function decodeBase64(str) {
  try {
    return Buffer.from(str.trim(), 'base64').toString('utf-8');
  } catch {
    return str;
  }
}

async function main() {
  console.log('📡 获取 abshare 订阅...\n');

  let content;
  try {
    content = await fetchWithRetry(SUB_URL);
    console.log('  ✅ 获取成功');
  } catch (err) {
    console.error(`  ❌ 获取失败: ${err.message}`);
    process.exit(1);
  }

  const decoded = decodeBase64(content);
  const isBase64 = decoded.includes('vmess://') || decoded.includes('vless://') || decoded.includes('trojan://');
  const nodeContent = isBase64 ? decoded : content;

  const now = new Date();
  const dateStr = now.toLocaleDateString('zh-CN', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const timeStr = now.toLocaleTimeString('zh-CN', {
    timeZone: 'Asia/Shanghai',
    hour: '2-digit',
    minute: '2-digit',
  });

  const markdown = `---
title: "免费订阅 - ABShare"
description: "ABShare 免费 V2Ray / Clash 订阅链接，每8小时自动更新。"
pubDate: ${now.toISOString().split('T')[0]}
category: "订阅"
tags: ["v2ray", "clash", "翻墙", "订阅", "免费", "abshare"]
lang: "zh"
---

> 🕐 最近更新：${dateStr} ${timeStr}
>
> 本页内容每8小时自动同步自 [abshare3](https://github.com/abshare3/abshare3.github.io)

---

## 订阅链接

**V2Ray / Clash / 小火箭 通用订阅：**

\`\`\`
${SUB_URL}
\`\`\`

---

## 节点列表

\`\`\`
${nodeContent.trim()}
\`\`\`

---

## 📖 使用说明

1. 复制上方订阅链接
2. 在 V2Ray / Clash / 小火箭客户端中选择「导入订阅」
3. 粘贴链接并更新即可

## 🔗 来源

- [GitHub 仓库](https://github.com/abshare3/abshare3.github.io)
`;

  const outPath = path.join(
    process.cwd(),
    'src',
    'content',
    'blog',
    'zh',
    'abshare',
    'index.md'
  );

  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, markdown, 'utf-8');
  console.log(`\n✅ 已写入 ${outPath}`);
}

main().catch(console.error);
