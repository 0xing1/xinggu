# 每日新闻自动更新功能

## 功能概述

博客新增"新闻"分类，每天自动更新一篇包含十条热门新闻的文章。

## 文件结构

```
scripts/
└── fetch-news.js          # 新闻获取脚本

src/content/blog/
├── zh/news/               # 中文新闻文章
└── en/news/               # 英文新闻文章

.github/workflows/
└── daily-news.yml         # GitHub Actions 自动化工作流
```

## 使用方法

### 手动运行

```bash
# 生成今日新闻
npm run news

# 或直接运行脚本
node scripts/fetch-news.js
```

### 自动运行

通过 GitHub Actions 每天自动运行：
- 时间：每天 UTC 8:00（北京时间 16:00）
- 自动提交更改到 Git
- 自动部署到 Cloudflare Pages

## 新闻内容

每篇文章包含：
- 4 条国内新闻
- 4 条国际新闻
- 今日关键词
- 编辑点评

## 自定义

### 修改新闻源

编辑 `scripts/fetch-news.js` 中的 `NEWS_SOURCES` 配置：

```javascript
const NEWS_SOURCES = {
  domestic: [
    { name: '新华网', url: '...' },
    { name: '人民网', url: '...' },
  ],
  international: [
    { name: 'BBC News', url: '...' },
    { name: 'Reuters', url: '...' },
  ]
};
```

### 修改更新时间

编辑 `.github/workflows/daily-news.yml` 中的 cron 表达式：

```yaml
schedule:
  - cron: '0 8 * * *'  # UTC 8:00 = 北京时间 16:00
```

## 部署要求

1. 在 GitHub 仓库设置中添加以下 Secrets：
   - `CLOUDFLARE_API_TOKEN`
   - `CLOUDFLARE_ACCOUNT_ID`

2. 确保 Cloudflare Pages 项目已创建

## 注意事项

- 当前使用模拟数据，实际使用时需要接入真实新闻 API
- 新闻内容由 AI 自动生成，仅供参考
- 建议定期检查新闻质量
