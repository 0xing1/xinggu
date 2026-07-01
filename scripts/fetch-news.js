#!/usr/bin/env node

/**
 * 前沿科技新闻获取脚本
 * 每天自动获取 3-5 条最新科技新闻并附带直达链接
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

// 日期格式化
function formatDate(date) {
  return date.toISOString().split('T')[0];
}

function formatDateChinese(date) {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${year}年${month}月${day}日`;
}

// HTTP 请求封装
function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('Request timeout')), 10000);
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      clearTimeout(timeout);
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        fetchUrl(res.headers.location).then(resolve).catch(reject);
        return;
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
      res.on('error', reject);
    }).on('error', (err) => {
      clearTimeout(timeout);
      reject(err);
    });
  });
}

// 解析 RSS XML
function parseRSS(xml) {
  const items = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;
  while ((match = itemRegex.exec(xml)) !== null) {
    const itemXml = match[1];
    const title = extractTag(itemXml, 'title');
    const link = extractTag(itemXml, 'link');
    const description = extractTag(itemXml, 'description');
    const pubDate = extractTag(itemXml, 'pubDate');
    // 提取图片：从 media:content、media:thumbnail、enclosure 或 description 中的 img
    const image = extractImage(itemXml, description);
    if (title && link) {
      items.push({
        title: cleanHtml(title).substring(0, 100),
        link: link.trim(),
        description: cleanHtml(description || '').substring(0, 200),
        pubDate: pubDate || '',
        image: image || ''
      });
    }
  }
  return items;
}

// 提取图片 URL
function extractImage(itemXml, description) {
  // media:content 或 media:thumbnail
  const mediaMatch = itemXml.match(/<media:(?:content|thumbnail)[^>]+url="([^"]+)"/);
  if (mediaMatch) return mediaMatch[1];

  // enclosure
  const enclosureMatch = itemXml.match(/<enclosure[^>]+url="([^"]+)"/);
  if (enclosureMatch) return enclosureMatch[1];

  // description 中的 img src
  if (description) {
    const imgMatch = description.match(/<img[^>]+src="([^"]+)"/);
    if (imgMatch) return imgMatch[1];
  }

  // content:encoded 中的 img
  const contentMatch = itemXml.match(/<content:encoded>([\s\S]*?)<\/content:encoded>/);
  if (contentMatch) {
    const imgInContent = contentMatch[1].match(/<img[^>]+src="([^"]+)"/);
    if (imgInContent) return imgInContent[1];
  }

  return '';
}

function extractTag(xml, tag) {
  const regex = new RegExp(`<${tag}[^>]*>(?:<!\\[CDATA\\[)?(.*?)(?:\\]\\]>)?<\\/${tag}>`, 's');
  const match = xml.match(regex);
  return match ? match[1].trim() : '';
}

function cleanHtml(str) {
  return str
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// 科技新闻源
const TECH_SOURCES = [
  {
    name: '36氪',
    url: 'https://36kr.com/feed',
    category: '国内科技'
  },
  {
    name: 'Hacker News',
    url: 'https://hnrss.org/frontpage?count=10',
    category: '国际科技'
  },
  {
    name: 'TechCrunch',
    url: 'https://techcrunch.com/feed/',
    category: '国际科技'
  },
  {
    name: 'The Verge',
    url: 'https://www.theverge.com/rss/index.xml',
    category: '国际科技'
  },
  {
    name: 'Solidot',
    url: 'https://www.solidot.org/index.rss',
    category: '国内科技'
  },
  {
    name: 'Ars Technica',
    url: 'https://feeds.arstechnica.com/arstechnica/index/',
    category: '国际科技'
  },
  {
    name: 'Wired',
    url: 'https://www.wired.com/feed/rss',
    category: '国际科技'
  },
  {
    name: '少数派',
    url: 'https://sspai.com/feed',
    category: '国内科技'
  },
  {
    name: 'MIT Tech Review',
    url: 'https://www.technologyreview.com/feed/',
    category: '国际科技'
  }
];

// 获取新闻
async function fetchNews() {
  const allNews = [];

  for (const source of TECH_SOURCES) {
    try {
      console.log(`📡 正在获取 ${source.name}...`);
      const xml = await fetchUrl(source.url);
      const items = parseRSS(xml);
      const news = items.slice(0, 5).map(item => ({
        ...item,
        source: source.name,
        category: source.category
      }));
      allNews.push(...news);
      console.log(`  ✅ 获取到 ${news.length} 条新闻`);
    } catch (error) {
      console.log(`  ⚠️  ${source.name} 获取失败: ${error.message}`);
    }
  }

  return allNews;
}

// 筛选科技新闻（3-5条）
function filterTechNews(news) {
  // 优先选择科技相关关键词
  const techKeywords = ['AI', '人工智能', '芯片', '量子', '机器人', '自动驾驶', '5G', '6G',
    '区块链', 'Web3', '元宇宙', 'VR', 'AR', '云计算', '大数据', '半导体',
    'Apple', 'Google', 'Microsoft', 'OpenAI', '特斯拉', '华为', '小米',
    'startup', '融资', 'IPO', '发布', 'launch', 'release', 'announce'];

  // 按关键词匹配度排序
  const scored = news.map(item => {
    const text = `${item.title} ${item.description}`.toLowerCase();
    let score = 0;
    techKeywords.forEach(kw => {
      if (text.includes(kw.toLowerCase())) score += 1;
    });
    return { ...item, score };
  });

  scored.sort((a, b) => b.score - a.score);

  // 取 3-5 条
  const count = Math.min(5, Math.max(3, scored.length));
  return scored.slice(0, count);
}

// 生成新闻文章
function generateNewsArticle(date, newsItems) {
  const dateStr = formatDate(date);
  const dateChinese = formatDateChinese(date);
  const weekday = ['日', '一', '二', '三', '四', '五', '六'][date.getDay()];

  const content = `---
title: "前沿科技速递 - ${dateChinese}"
description: "${dateChinese}（星期${weekday}）最新前沿科技新闻，涵盖 AI、芯片、量子计算、新能源等领域。"
pubDate: ${dateStr}
category: "科技前沿"
tags: ["科技", "前沿", "AI", "芯片", "创新"]
lang: "zh"
${newsItems[0]?.image ? `heroImage: "${newsItems[0].image}"` : ''}
---

## 🚀 ${dateChinese} 前沿科技速递

> 每日精选 3-5 条最新前沿科技动态，把握科技脉搏。

---

${newsItems.map((news, index) => `### ${index + 1}. ${news.title}

${news.image ? `![${news.title}](${news.image})` : ''}

${news.description}

🔗 **阅读原文**：[${news.source}](${news.link})

---
`).join('\n')}

*数据来源：36氪、Solidot、少数派、Hacker News、TechCrunch、The Verge、Ars Technica、Wired、MIT Tech Review*
`;

  return content;
}

// 生成英文文章
function generateEnglishNewsArticle(date, newsItems) {
  const dateStr = formatDate(date);
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const dateEnglish = date.toLocaleDateString('en-US', options);

  return `---
title: "Tech Frontier Digest - ${dateEnglish}"
description: "Latest cutting-edge technology news for ${dateEnglish}, covering AI, chips, quantum computing, and more."
pubDate: ${dateStr}
category: "Tech Frontier"
tags: ["tech", "frontier", "AI", "chips", "innovation"]
lang: "en"
${newsItems[0]?.image ? `heroImage: "${newsItems[0].image}"` : ''}
---

## 🚀 ${dateEnglish} Tech Frontier Digest

> Daily curated 3-5 latest cutting-edge technology news to stay ahead.

---

${newsItems.map((news, index) => `### ${index + 1}. ${news.title}

${news.image ? `![${news.title}](${news.image})` : ''}

${news.description}

🔗 **Read more**: [${news.source}](${news.link})

---
`).join('\n')}

*Sources: 36Kr, Solidot, sspai, Hacker News, TechCrunch, The Verge, Ars Technica, Wired, MIT Tech Review*
`;
}

// 主函数
async function main() {
  console.log('🚀 开始获取前沿科技新闻...\n');

  try {
    // 获取新闻
    const allNews = await fetchNews();
    console.log(`\n📰 共获取 ${allNews.length} 条新闻`);

    // 筛选科技新闻
    const techNews = filterTechNews(allNews);
    console.log(`🔍 筛选出 ${techNews.length} 条前沿科技新闻\n`);

    if (techNews.length === 0) {
      console.log('⚠️  未获取到新闻，使用备用数据');
      return;
    }

    // 显示新闻列表
    techNews.forEach((news, i) => {
      console.log(`${i + 1}. [${news.source}] ${news.title}`);
      console.log(`   🔗 ${news.link}\n`);
    });

    // 生成文章
    const today = new Date();
    const dateStr = formatDate(today);

    // 中文文章
    const zhContent = generateNewsArticle(today, techNews);
    const zhDir = path.join(rootDir, 'src', 'content', 'blog', 'zh', 'tech');
    if (!fs.existsSync(zhDir)) fs.mkdirSync(zhDir, { recursive: true });
    const zhPath = path.join(zhDir, `tech-news-${dateStr}.md`);

    // 英文文章
    const enContent = generateEnglishNewsArticle(today, techNews);
    const enDir = path.join(rootDir, 'src', 'content', 'blog', 'en', 'tech');
    if (!fs.existsSync(enDir)) fs.mkdirSync(enDir, { recursive: true });
    const enPath = path.join(enDir, `tech-news-${dateStr}.md`);

    // 检查是否已存在
    if (fs.existsSync(zhPath)) {
      console.log(`⚠️  今日科技新闻已存在: ${zhPath}`);
      return;
    }

    // 写入文件
    fs.writeFileSync(zhPath, zhContent, 'utf8');
    console.log(`✅ 已生成中文新闻: ${zhPath}`);

    fs.writeFileSync(enPath, enContent, 'utf8');
    console.log(`✅ 已生成英文新闻: ${enPath}`);

    console.log('\n🎉 科技新闻获取完成！');
  } catch (error) {
    console.error('❌ 获取新闻失败:', error.message);
    process.exit(1);
  }
}

main();
