import fs from 'fs';
import path from 'path';
import https from 'https';

// 前两个源：每小时定时更新
const SOURCES = [
  {
    name: 'V2Ray',
    repo: 'hello-world-1989/cn-news',
    filePath: 'end-gfw-together',
    description: '基础 V2Ray 订阅',
  },
  {
    name: 'Clash',
    repo: 'hello-world-1989/cn-news',
    filePath: 'clash.yaml',
    description: 'Clash 订阅配置',
  },
  {
    name: 'V2Ray 高速',
    repo: 'hello-world-1989/v2-sub',
    filePath: 'end-gfw-together-af3e13',
    description: '高速 V2Ray 订阅（每3天更新）',
  },
];

function apiGet(url) {
  return new Promise((resolve, reject) => {
    https
      .get(
        url,
        {
          headers: {
            'User-Agent': 'sub-crawler/1.0',
            Accept: 'application/vnd.github.v3+json',
          },
        },
        (res) => {
          if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
            return apiGet(res.headers.location).then(resolve, reject);
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
      return await apiGet(url);
    } catch (err) {
      if (i < retries - 1) {
        await new Promise((r) => setTimeout(r, 2000 * (i + 1)));
      } else {
        throw err;
      }
    }
  }
}

async function fetchSubContent(source) {
  const apiUrl = `https://api.github.com/repos/${source.repo}/contents/${source.filePath}`;
  const body = await fetchWithRetry(apiUrl);
  const json = JSON.parse(body);

  if (json.content) {
    return Buffer.from(json.content, 'base64').toString('utf-8');
  }
  if (json.download_url) {
    return await fetchWithRetry(json.download_url);
  }
  throw new Error('无法获取内容');
}

function generateMarkdown(results) {
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

  let md = `---
title: "免费订阅 - V2Ray / Clash"
description: "自动更新的 V2Ray 和 Clash 订阅链接，每小时同步一次。"
pubDate: ${now.toISOString().split('T')[0]}
category: "订阅"
tags: ["v2ray", "clash", "翻墙", "订阅", "免费"]
lang: "zh"
---

> 🕐 最近更新：${dateStr} ${timeStr}
>
> 本页内容每小时自动同步自 [hello-world-1989/cn-news](https://github.com/hello-world-1989/cn-news)

---

`;

  for (const result of results) {
    if (!result.success) {
      md += `## ❌ ${result.name}\n\n获取失败: ${result.error}\n\n---\n\n`;
      continue;
    }

    md += `## ${result.name}\n\n`;
    md += `> ${result.description}\n\n`;

    if (result.name === 'Clash') {
      md += `**订阅链接（复制到 Clash 客户端）：**\n\n`;
      md += `\`\`\`\nhttps://raw.githubusercontent.com/${result.repo}/refs/heads/main/${result.filePath}\n\`\`\`\n\n`;
      md += `> ⚠️ Clash 配置文件较大，请直接使用上方链接导入客户端。\n\n`;
    } else {
      md += `**订阅链接（复制到 V2Ray 客户端）：**\n\n`;
      md += `\`\`\`\nhttps://raw.githubusercontent.com/${result.repo}/main/${result.filePath}\n\`\`\`\n\n`;

      md += `**节点列表：**\n\n`;
      md += '\`\`\`\n';
      md += result.content.trim();
      md += '\n\`\`\`\n\n';
    }

    md += `---\n\n`;
  }

  md += `## 📖 使用说明\n\n`;
  md += `1. **V2Ray / Clash / 小火箭** 等客户端支持订阅链接导入\n`;
  md += `2. 复制上方对应的订阅链接\n`;
  md += `3. 在客户端中选择"导入订阅"或"添加订阅"\n`;
  md += `4. 粘贴链接并更新即可\n\n`;
  md += `> 💡 为提高稳定性，部分节点屏蔽视频和游戏网站，美国节点无限制。\n\n`;
  md += `## 🔗 相关链接\n\n`;
  md += `- [大翻墙运动](https://end-gfw.com)\n`;
  md += `- [GitHub 仓库](https://github.com/hello-world-1989/cn-news)\n`;

  return md;
}

async function main() {
  console.log('📡 开始获取订阅（每小时定时）...\n');

  const results = [];

  for (const src of SOURCES) {
    try {
      const content = await fetchSubContent(src);
      results.push({ ...src, content, success: true });
      console.log(`  ✅ ${src.name}`);
    } catch (err) {
      results.push({ ...src, success: false, error: err.message });
      console.log(`  ❌ ${src.name}: ${err.message}`);
    }
    await new Promise((r) => setTimeout(r, 2000));
  }

  const markdown = generateMarkdown(results);

  const outPath = path.join(
    process.cwd(),
    'src',
    'content',
    'blog',
    'zh',
    'sub',
    'index.md'
  );

  fs.writeFileSync(outPath, markdown, 'utf-8');
  console.log(`\n✅ 已写入 ${outPath}`);
}

main().catch(console.error);
