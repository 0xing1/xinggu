import fs from 'fs';
import path from 'path';
import * as cheerio from 'cheerio';

// ---------- 配置 ----------
const BASE_URL = 'https://www.mibei77.com';
const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1 Safari/605.1.15',
  'Mozilla/5.0 (X11; Linux x86_64; rv:133.0) Gecko/20100101 Firefox/133.0',
];

function randomUA() {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

// ---------- HTTP 请求 ----------

async function fetchHTML(url, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': randomUA(),
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
          'Accept-Encoding': 'gzip, deflate, br',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
        },
        redirect: 'follow',
        signal: AbortSignal.timeout(15000),
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${url}`);
      }
      return await res.text();
    } catch (e) {
      if (i === retries - 1) throw e;
      console.log(`    ⚠️ 重试 ${i + 1}/${retries}: ${e.message}`);
      await new Promise((r) => setTimeout(r, 2000 * (i + 1)));
    }
  }
}

// ---------- 从首页获取最新文章链接 ----------

async function getLatestPostUrl() {
  console.log('  🔍 正在请求首页...');
  const html = await fetchHTML(BASE_URL);
  const $ = cheerio.load(html);

  // 用 CSS 选择器查找文章链接，比正则更健壮
  const articleLinks = [];
  $('a[href*=".html"]').each((_, el) => {
    const href = $(el).attr('href');
    if (href) {
      const fullUrl = href.startsWith('http') ? href : new URL(href, BASE_URL).href;
      if (/\/\d+\.html$/.test(fullUrl) && fullUrl.includes('mibei77.com')) {
        articleLinks.push(fullUrl);
      }
    }
  });

  if (articleLinks.length === 0) {
    console.log('    ⚠️ CSS 选择器未找到，使用正则降级...');
    const regexMatches = html.match(/href="(https:\/\/www\.mibei77\.com\/\d+\.html)"/g);
    if (regexMatches && regexMatches.length > 0) {
      const url = regexMatches[0].match(/href="([^"]+)"/)[1];
      return url;
    }
    throw new Error('未找到文章链接，页面结构可能已变更');
  }

  const unique = [...new Set(articleLinks)];
  unique.sort((a, b) => {
    const idA = parseInt(a.match(/(\d+)\.html$/)[1]);
    const idB = parseInt(b.match(/(\d+)\.html$/)[1]);
    return idB - idA;
  });

  const latestUrl = unique[0];
  console.log(`    ✅ 找到 ${unique.length} 篇文章，最新: ${latestUrl}`);
  return latestUrl;
}

// ---------- 从文章页面提取订阅链接 ----------

async function extractSubLinks(postUrl) {
  console.log('  🔍 正在请求文章页...');
  const html = await fetchHTML(postUrl);
  const $ = cheerio.load(html);

  let v2ray = null;
  let clash = null;

  const contentSelectors = ['.entry-content', '.post-content', '.article-content', 'article', 'body'];

  for (const selector of contentSelectors) {
    const container = $(selector);
    if (container.length === 0) continue;

    const text = container.text();
    const links = [];

    container.find('a').each((_, el) => {
      const href = $(el).attr('href') || '';
      links.push(href);
    });

    for (const link of links) {
      if (!v2ray && /\.txt(\?|$)/.test(link)) {
        v2ray = link;
      }
      if (!clash && /\.yaml(\?|$)/.test(link)) {
        clash = link;
      }
      if (v2ray && clash) break;
    }

    if (!v2ray) {
      const txtMatch = text.match(/https:\/\/[^\s"'<>]+\.txt(\?[^\s"'<>]*)?/);
      if (txtMatch) v2ray = txtMatch[0];
    }
    if (!clash) {
      const yamlMatch = text.match(/https:\/\/[^\s"'<>]+\.yaml(\?[^\s"'<>]*)?/);
      if (yamlMatch) clash = yamlMatch[0];
    }

    if (v2ray && clash) break;
  }

  return { v2ray, clash };
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
  const pubDate =
    now.toLocaleString('sv-SE', { timeZone: 'Asia/Shanghai' }).replace(' ', 'T') + '+08:00';

  return `---
title: "米贝每日节点"
description: "米贝分享每日免费节点，每小时自动更新。"
pubDate: ${pubDate}
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
    const postUrl = await getLatestPostUrl();

    console.log('  🔍 提取订阅链接...');
    const links = await extractSubLinks(postUrl);

    if (links.v2ray) {
      console.log(`    ✅ V2Ray: ${links.v2ray.substring(0, 60)}...`);
    } else {
      console.log('    ⚠️ 未找到 V2Ray 链接');
    }
    if (links.clash) {
      console.log(`    ✅ Clash: ${links.clash.substring(0, 60)}...`);
    } else {
      console.log('    ⚠️ 未找到 Clash 链接');
    }

    const markdown = generateMarkdown(links, postUrl);

    const outPath = path.join(process.cwd(), 'src', 'content', 'blog', 'zh', 'mibei', 'index.md');
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, markdown, 'utf-8');
    console.log(`\n✅ 已写入 ${outPath}`);

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
