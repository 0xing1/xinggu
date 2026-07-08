import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import https from 'https';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 日期格式化
function formatDate(date) {
  return date.toISOString().split('T')[0];
}

// 日期时间格式化（用于pubDate，北京时间）
function formatDateTime(date) {
  return date.toLocaleString('sv-SE', { timeZone: 'Asia/Shanghai' }).replace(' ', 'T') + '+08:00';
}

function formatDateChinese(date) {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${year}年${month}月${day}日`;
}

// HTTP 请求封装
function httpsGet(url, timeout = 10000) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { timeout }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        httpsGet(res.headers.location, timeout).then(resolve).catch(reject);
        return;
      }
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(data);
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${url}`));
        }
      });
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error(`Timeout: ${url}`)); });
  });
}

// RSS 源列表
const RSS_FEEDS = [
  // 中文源
  { name: '36氪', url: 'https://36kr.com/feed', lang: 'zh', category: 'tech' },
  { name: '少数派', url: 'https://sspai.com/feed', lang: 'zh', category: 'tech' },
  { name: 'Solidot', url: 'https://www.solidot.org/index.rss', lang: 'zh', category: 'tech' },
  // 英文源
  { name: 'Hacker News', url: 'https://hnrss.org/frontpage', lang: 'en', category: 'tech' },
  { name: 'TechCrunch', url: 'https://techcrunch.com/feed/', lang: 'en', category: 'tech' },
  { name: 'The Verge', url: 'https://www.theverge.com/rss/index.xml', lang: 'en', category: 'tech' },
  { name: 'Ars Technica', url: 'https://feeds.arstechnica.com/arstechnica/index', lang: 'en', category: 'tech' },
  { name: 'Wired', url: 'https://www.wired.com/feed/rss', lang: 'en', category: 'tech' },
  { name: 'MIT Tech Review', url: 'https://www.technologyreview.com/feed/', lang: 'en', category: 'tech' },
];

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

// 提取 XML 标签内容
function extractTag(xml, tag) {
  // 处理 CDATA
  const cdataRegex = new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]></${tag}>`, 'i');
  const cdataMatch = xml.match(cdataRegex);
  if (cdataMatch) return cdataMatch[1].trim();
  
  // 普通标签
  const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i');
  const match = xml.match(regex);
  return match ? match[1].trim() : null;
}

// 提取图片
function extractImage(itemXml, description) {
  // media:content 或 media:thumbnail
  const mediaMatch = itemXml.match(/<(media:content|media:thumbnail)[^>]*url="([^"]+)"/i);
  if (mediaMatch) return mediaMatch[2];
  
  // enclosure
  const enclosureMatch = itemXml.match(/<enclosure[^>]*url="([^"]+)"[^>]*type="image/i);
  if (enclosureMatch) return enclosureMatch[1];
  
  // 从 description 中提取 img
  if (description) {
    const imgMatch = description.match(/<img[^>]*src="([^"]+)"/i);
    if (imgMatch) return imgMatch[1];
  }
  
  return null;
}

// 清理 HTML
function cleanHtml(html) {
  return html
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

// 获取新闻
async function fetchNews() {
  const allItems = [];
  
  for (const feed of RSS_FEEDS) {
    try {
      console.log(`Fetching ${feed.name}...`);
      const xml = await httpsGet(feed.url);
      const items = parseRSS(xml);
      const taggedItems = items.map(item => ({
        ...item,
        source: feed.name,
        lang: feed.lang,
        category: feed.category
      }));
      allItems.push(...taggedItems.slice(0, 10)); // 每个源最多10条
      console.log(`  Got ${Math.min(items.length, 10)} items from ${feed.name}`);
    } catch (error) {
      console.error(`  Error fetching ${feed.name}: ${error.message}`);
    }
  }
  
  return allItems;
}

// 评分和筛选新闻
function scoreAndSelect(items) {
  const now = Date.now();
  const oneDayAgo = now - 24 * 60 * 60 * 1000;
  
  const scored = items
    .filter(item => {
      // 过滤超过24小时的新闻
      if (item.pubDate) {
        const pubTime = new Date(item.pubDate).getTime();
        if (pubTime < oneDayAgo) return false;
      }
      return true;
    })
    .map(item => {
      let score = 0;
      
      // 标题关键词评分
      const title = item.title.toLowerCase();
      const desc = item.description.toLowerCase();
      
      // AI 相关
      if (/ai|人工智能|gpt|llm|大模型|机器学习|深度学习|neural|openai|google ai|anthropic/i.test(title + desc)) score += 3;
      
      // 芯片/硬件
      if (/芯片|半导体|chip|nvidia|amd|intel|quantum|量子/i.test(title + desc)) score += 2;
      
      // 新能源/气候
      if (/新能源|电池|solar|climate|碳|hydrogen|氢能|ev|电动车/i.test(title + desc)) score += 2;
      
      // 生物科技
      if (/biotech|基因|crispr|drug|药|医疗/i.test(title + desc)) score += 1;
      
      // 太空/航天
      if (/space|spacex|nasa|火箭|卫星|航天/i.test(title + desc)) score += 1;
      
      // 创新/创业
      if (/startup|融资|估值|launch|发布|release/i.test(title + desc)) score += 1;
      
      return { ...item, score };
    })
    .sort((a, b) => b.score - a.score);
  
  // 取前3-5条
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
pubDate: ${formatDateTime(date)}
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
pubDate: ${formatDateTime(date)}
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

*Sources: 36Kr, Solidot, Sspai, Hacker News, TechCrunch, The Verge, Ars Technica, Wired, MIT Tech Review*
`;
}

// 主函数
async function main() {
  console.log('Fetching daily news...');
  
  const allNews = await fetchNews();
  console.log(`Total news items: ${allNews.length}`);
  
  if (allNews.length === 0) {
    console.log('No news fetched, exiting...');
    return;
  }
  
  const selectedNews = scoreAndSelect(allNews);
  console.log(`Selected ${selectedNews.length} news items`);
  
  const date = new Date();
  const dateStr = formatDate(date);
  
  // 生成中文文章
  const zhArticle = generateNewsArticle(date, selectedNews);
  const zhDir = join(__dirname, '../src/content/blog/zh/news');
  if (!existsSync(zhDir)) mkdirSync(zhDir, { recursive: true });
  writeFileSync(join(zhDir, `tech-news-${dateStr}.md`), zhArticle);
  console.log(`Created zh/tech-news-${dateStr}.md`);
  
  // 生成英文文章
  const enArticle = generateEnglishNewsArticle(date, selectedNews);
  const enDir = join(__dirname, '../src/content/blog/en/tech');
  if (!existsSync(enDir)) mkdirSync(enDir, { recursive: true });
  writeFileSync(join(enDir, `tech-news-${dateStr}.md`), enArticle);
  console.log(`Created en/tech-news-${dateStr}.md`);
  
  console.log('Done!');
}

main().catch(console.error);
