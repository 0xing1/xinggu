import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import RssParser from 'rss-parser';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const rssParser = new RssParser({
  timeout: 15000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (compatible; astro-blog-rss-reader/1.0)',
    'Accept': 'application/rss+xml, application/xml, text/xml, */*',
  },
  // 自定义字段：支持 media:content
  customFields: {
    item: [
      ['media:content', 'mediaContent'],
      ['media:thumbnail', 'mediaThumbnail'],
    ],
  },
});

// ---------- 日期格式化 ----------

function formatDate(date) {
  return date.toISOString().split('T')[0];
}

function formatDateTime(date) {
  return date.toLocaleString('sv-SE', { timeZone: 'Asia/Shanghai' }).replace(' ', 'T') + '+08:00';
}

function formatDateChinese(date) {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${year}年${month}月${day}日`;
}

// ---------- RSS 源配置 ----------

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

// ---------- 新闻抓取 ----------

/**
 * 从单个 RSS 源获取条目
 */
async function fetchFeed(feed) {
  try {
    const parsed = await rssParser.parseURL(feed.url);

    if (!parsed.items || parsed.items.length === 0) {
      console.log(`  ⚠️ ${feed.name}: 空结果`);
      return [];
    }

    const items = parsed.items.slice(0, 10).map((item) => {
      // 提取图片：media:content > media:thumbnail > enclosure > description img
      const image = extractImage(item);

      // 清理描述文本
      const desc = cleanHtml(
        (item.contentSnippet || item.content || item.summary || '').substring(0, 300)
      );

      return {
        title: cleanHtml(item.title || '').substring(0, 100),
        link: item.link?.trim() || '',
        description: desc,
        pubDate: item.pubDate || item.isoDate || '',
        image,
        source: feed.name,
        lang: feed.lang,
        category: feed.category,
      };
    });

    console.log(`  ✅ ${feed.name}: ${items.length} 条`);
    return items;
  } catch (e) {
    console.error(`  ❌ ${feed.name}: ${e.message}`);
    return [];
  }
}

/**
 * 从 RSS 条目中提取图片 URL
 */
function extractImage(item) {
  // media:content（自定义字段）
  if (item.mediaContent) {
    const mc = item.mediaContent;
    if (typeof mc === 'object' && mc.$) return mc.$.url;
    if (typeof mc === 'string') {
      // 可能是 JSON 字符串
      try {
        const parsed = JSON.parse(mc);
        if (parsed.$?.url) return parsed.$.url;
      } catch {}
      const match = mc.match(/url="([^"]+)"/);
      if (match) return match[1];
    }
  }

  // media:thumbnail
  if (item.mediaThumbnail) {
    const mt = item.mediaThumbnail;
    if (typeof mt === 'object' && mt.$) return mt.$.url;
  }

  // enclosure
  if (item.enclosure?.url && /image/i.test(item.enclosure.type || '')) {
    return item.enclosure.url;
  }

  // description 中的 img 标签
  const content = item.content || item['content:encoded'] || item.summary || '';
  if (content) {
    const imgMatch = content.match(/<img[^>]*src="([^"]+)"/i);
    if (imgMatch) return imgMatch[1];
  }

  return '';
}

/**
 * 清理 HTML 标签和实体
 */
function cleanHtml(html) {
  return html
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&ldquo;/g, '"')
    .replace(/&rdquo;/g, '"')
    .replace(/&mdash;/g, '—')
    .replace(/&ndash;/g, '–')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * 并发抓取所有 RSS 源
 */
async function fetchAllFeeds() {
  const results = await Promise.all(RSS_FEEDS.map((feed) => fetchFeed(feed)));
  return results.flat();
}

// ---------- 评分与筛选 ----------

function scoreAndSelect(items) {
  const now = Date.now();
  const oneDayAgo = now - 24 * 60 * 60 * 1000;

  const scored = items
    .filter((item) => {
      if (item.pubDate) {
        const pubTime = new Date(item.pubDate).getTime();
        if (isNaN(pubTime)) return true; // 无法解析日期则保留
        if (pubTime < oneDayAgo) return false;
      }
      return true;
    })
    .map((item) => {
      let score = 0;
      const combined = `${item.title} ${item.description}`.toLowerCase();

      // AI / 大模型
      if (/ai|人工智能|gpt|llm|大模型|机器学习|深度学习|neural|openai|google ai|anthropic|model|agent/i.test(combined)) score += 3;

      // 芯片 / 硬件
      if (/芯片|半导体|chip|nvidia|amd|intel|quantum|量子|gpu|tpu|processor/i.test(combined)) score += 2;

      // 新能源 / 气候
      if (/新能源|电池|solar|climate|碳|hydrogen|氢能|ev|电动车|battery|energy/i.test(combined)) score += 2;

      // 生物科技
      if (/biotech|基因|crispr|drug|药|医疗|biology|dna|protein/i.test(combined)) score += 1;

      // 太空 / 航天
      if (/space|spacex|nasa|火箭|卫星|航天|rocket|satellite|mars/i.test(combined)) score += 1;

      // 创新 / 创业 / 融资
      if (/startup|融资|估值|launch|发布|release|funding|acquisition|ipo/i.test(combined)) score += 1;

      return { ...item, score };
    })
    .sort((a, b) => b.score - a.score);

  // 去重：相同标题只保留一条
  const seen = new Set();
  const deduped = [];
  for (const item of scored) {
    const key = item.title.toLowerCase().substring(0, 60);
    if (!seen.has(key)) {
      seen.add(key);
      deduped.push(item);
    }
  }

  const count = Math.min(5, Math.max(3, deduped.length));
  return deduped.slice(0, count);
}

// ---------- 生成文章 ----------

function generateNewsArticle(date, newsItems) {
  const dateChinese = formatDateChinese(date);
  const weekday = ['日', '一', '二', '三', '四', '五', '六'][date.getDay()];

  return `---
title: "前沿科技速递 - ${dateChinese}"
description: "${dateChinese}（星期${weekday}）最新前沿科技新闻，涵盖 AI、芯片、量子计算、新能源等领域。"
pubDate: ${formatDateTime(date)}
category: "科技前沿"
tags: ["科技", "前沿", "AI", "芯片", "创新"]
lang: "zh"
${newsItems[0]?.image ? `heroImage: "${newsItems[0].image}"` : ''}
---

## 🚀 ${dateChinese} 前沿科技速递

> 每日精选 ${newsItems.length} 条最新前沿科技动态，把握科技脉搏。

---

${newsItems.map((news, index) => `### ${index + 1}. ${news.title}

${news.image ? `![${news.title}](${news.image})` : ''}

${news.description}

🔗 **阅读原文**：[${news.source}](${news.link})

---
`).join('\n')}

*数据来源：36氪、Solidot、少数派、Hacker News、TechCrunch、The Verge、Ars Technica、Wired、MIT Tech Review*
`;
}

function generateEnglishNewsArticle(date, newsItems) {
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

> Daily curated ${newsItems.length} latest cutting-edge technology news to stay ahead.

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

// ---------- Main ----------

async function main() {
  console.log('📡 开始抓取每日科技新闻...\n');

  // 1. 并发抓取所有 RSS 源
  const allNews = await fetchAllFeeds();
  console.log(`\n📊 共获取 ${allNews.length} 条新闻\n`);

  if (allNews.length === 0) {
    console.log('❌ 未获取到任何新闻，退出');
    return;
  }

  // 2. 评分筛选
  const selectedNews = scoreAndSelect(allNews);
  console.log(`🎯 精选 ${selectedNews.length} 条新闻:\n`);
  selectedNews.forEach((n, i) => {
    console.log(`  ${i + 1}. [${n.source}] ${n.title} (评分: ${n.score})`);
  });

  // 3. 生成文章
  const date = new Date();
  const dateStr = formatDate(date);

  // 中文文章
  const zhArticle = generateNewsArticle(date, selectedNews);
  const zhDir = join(__dirname, '../src/content/blog/zh/news');
  if (!existsSync(zhDir)) mkdirSync(zhDir, { recursive: true });
  writeFileSync(join(zhDir, `tech-news-${dateStr}.md`), zhArticle);
  console.log(`\n✅ 已创建 zh/tech-news-${dateStr}.md`);

  // 英文文章
  const enArticle = generateEnglishNewsArticle(date, selectedNews);
  const enDir = join(__dirname, '../src/content/blog/en/tech');
  if (!existsSync(enDir)) mkdirSync(enDir, { recursive: true });
  writeFileSync(join(enDir, `tech-news-${dateStr}.md`), enArticle);
  console.log(`✅ 已创建 en/tech-news-${dateStr}.md`);

  console.log('\n🎉 完成！');
}

main().catch(console.error);
