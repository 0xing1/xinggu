import fs from 'fs';
import path from 'path';
import https from 'https';

// ---------- HTTP helpers ----------

function httpsGet(url, headers = {}) {
  return new Promise((resolve, reject) => {
    https
      .get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', ...headers } }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          return httpsGet(res.headers.location, headers).then(resolve, reject);
        }
        if (res.statusCode !== 200) return reject(new Error(`HTTP ${res.statusCode}`));
        const chunks = [];
        res.on('data', (c) => chunks.push(c));
        res.on('end', () => resolve(Buffer.concat(chunks).toString()));
        res.on('error', reject);
      })
      .on('error', reject);
  });
}

async function retry(fn, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try { return await fn(); } catch (e) {
      if (i === retries - 1) throw e;
      await new Promise((r) => setTimeout(r, 2000 * (i + 1)));
    }
  }
}

// ---------- 从首页获取最新文章链接 ----------

async function getLatestPostUrl() {
  const html = await retry(() => httpsGet('https://www.mibei77.com/'));

  // 匹配文章链接，格式：https://www.mibei77.com/348.html
  const matches = html.match(/href="(https:\/\/www\.mibei77\.com\/\d+\.html)"/g);
  if (!matches || matches.length === 0) {
    throw new Error('未找到文章链接');
  }

  // 提取第一个链接
  const url = matches[0].match(/href="([^"]+)"/)[1];
  return url;
}

// ---------- 从文章页面提取订阅链接 ----------

async function extractSubLinks(postUrl) {
  const html = await retry(() => httpsGet(postUrl));

  // 提取 V2Ray 订阅链接
  const v2rayMatch = html.match(/https:\/\/mm\.mibei77\.com\/[^\s"<>]+\.txt/);
  // 提取 Clash 订阅链接
  const clashMatch = html.match(/https:\/\/mm\.mibei77\.com\/[^\s"<>]+\.yaml/);

  return {
    v2ray: v2rayMatch ? v2rayMatch[0] : null,
    clash: clashMatch ? clashMatch[0] : null,
  };
}

// ---------- 生成 Markdown ----------

function generateMarkdown(links, postUrl) {
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

  return `---
title: "米贝每日节点"
description: "米贝分享每日免费节点，每小时自动更新。"
pubDate: ${now.toLocaleString('sv-SE', { timeZone: 'Asia/Shanghai' }).replace(' ', 'T')}:00+08:00
category: "订阅"
tags: ["v2ray", "clash", "翻墙", "订阅", "免费", "米贝"]
lang: "zh"
---

> 🕐 最近更新：${dateStr} ${timeStr}
>
> 本页内容自动同步自 [米贝分享](https://www.mibei77.com)

---

## 订阅链接

**V2Ray / 小火箭 / WinXray 通用订阅：**

\`\`\`
${links.v2ray || '暂无可用链接'}
\`\`\`

**Clash Meta 订阅：**

\`\`\`
${links.clash || '暂无可用链接'}
\`\`\`

---

## 📖 使用说明

1. 复制上方订阅链接
2. 在 V2Ray / Clash / 小火箭客户端中选择「导入订阅」
3. 粘贴链接并更新即可

> 💡 米贝每日更新节点，链接会自动同步最新内容

## 🔗 来源

- [米贝分享](https://www.mibei77.com)
- [今日节点详情](${postUrl})
`;
}

// ---------- Main ----------

async function main() {
  console.log('📡 开始获取米贝每日节点...\n');

  try {
    // 1. 获取最新文章链接
    console.log('  🔍 获取最新文章链接...');
    const postUrl = await getLatestPostUrl();
    console.log(`    📄 最新文章: ${postUrl}`);

    // 2. 提取订阅链接
    console.log('  🔍 提取订阅链接...');
    const links = await extractSubLinks(postUrl);

    if (links.v2ray) console.log(`    ✅ V2Ray: ${links.v2ray.substring(0, 50)}...`);
    if (links.clash) console.log(`    ✅ Clash: ${links.clash.substring(0, 50)}...`);

    // 3. 生成 Markdown
    const markdown = generateMarkdown(links, postUrl);

    // 4. 写入文件
    const outPath = path.join(process.cwd(), 'src', 'content', 'blog', 'zh', 'mibei', 'index.md');
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, markdown, 'utf-8');
    console.log(`\n✅ 已写入 ${outPath}`);

    // 5. 设置 GitHub Actions 输出
    if (process.env.GITHUB_OUTPUT) {
      fs.appendFileSync(process.env.GITHUB_OUTPUT, 'changed=true\n');
    }
  } catch (e) {
    console.error(`\n❌ 获取失败: ${e.message}`);
    if (process.env.GITHUB_OUTPUT) {
      fs.appendFileSync(process.env.GITHUB_OUTPUT, 'changed=false\n');
    }
    process.exit(1);
  }
}

main().catch(console.error);
