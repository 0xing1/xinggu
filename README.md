# Astro 博客项目

一个基于 Astro 6 构建的现代化博客，支持多语言和内容集合。

## 功能特性

- 🚀 **Astro 6** - 最新的静态站点生成器
- 🌍 **多语言支持** - 中文和英文双语支持
- 📝 **内容集合** - 类型安全的内容管理
- 🎨 **响应式设计** - 适配各种设备
- ⚡ **零 JavaScript** - 默认不发送 JavaScript 到客户端
- 📱 **移动优先** - 优化的移动端体验

## 项目结构

```
astro-blog/
├── public/              # 静态资源
│   ├── favicon.svg     # 网站图标
│   └── robots.txt      # 搜索引擎配置
├── src/
│   ├── components/     # 可复用组件
│   │   ├── Header.astro
│   │   └── Footer.astro
│   ├── content/        # 内容集合
│   │   ├── config.ts   # 集合配置
│   │   └── blog/       # 博客文章
│   │       ├── zh/     # 中文文章
│   │       └── en/     # 英文文章
│   ├── layouts/        # 布局组件
│   │   ├── BaseLayout.astro
│   │   └── BlogPost.astro
│   ├── pages/          # 页面路由
│   │   ├── index.astro           # 中文首页
│   │   ├── about.astro           # 中文关于页
│   │   ├── blog/
│   │   │   ├── index.astro       # 中文博客列表
│   │   │   └── [...slug].astro   # 中文博客文章
│   │   └── en/                   # 英文页面
│   │       ├── index.astro
│   │       ├── about.astro
│   │       └── blog/
│   │           ├── index.astro
│   │           └── [...slug].astro
│   └── styles/         # 全局样式
│       └── global.css
├── astro.config.mjs    # Astro 配置
├── tsconfig.json       # TypeScript 配置
└── package.json        # 项目依赖
```

## 快速开始

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

访问 http://localhost:4321 查看网站。

### 构建生产版本

```bash
npm run build
```

### 预览生产版本

```bash
npm run preview
```

## 多语言支持

博客支持中文和英文两种语言：

- **中文**: `/` (首页), `/blog` (博客), `/about` (关于)
- **英文**: `/en/` (首页), `/en/blog` (博客), `/en/about` (关于)

语言切换器位于页面右上角，可以随时切换语言。

## 内容集合

博客文章使用 Astro 的内容集合功能管理，提供类型安全的内容管理。

### 文章格式

```markdown
---
title: "文章标题"
description: "文章描述"
pubDate: 2024-01-15
category: "分类"
tags: ["标签1", "标签2"]
lang: "zh"
---

文章内容...
```

### 添加新文章

1. 在 `src/content/blog/zh/` 或 `src/content/blog/en/` 目录下创建新的 Markdown 文件
2. 添加 frontmatter 元数据
3. 编写文章内容
4. 重新构建网站

## 自定义

### 修改样式

全局样式在 `src/styles/global.css` 中定义。组件样式在各自的 `.astro` 文件中使用 `<style>` 标签定义。

### 修改配置

网站配置在 `astro.config.mjs` 中定义，包括：

- 网站 URL
- 多语言设置
- 集成插件

### 添加新页面

在 `src/pages/` 目录下创建新的 `.astro` 文件。Astro 使用文件系统路由，文件路径会自动转换为 URL。

## 部署

### Vercel

```bash
npm run build
```

将 `dist/` 目录部署到 Vercel。

### Netlify

```bash
npm run build
```

将 `dist/` 目录部署到 Netlify。

### GitHub Pages

1. 在仓库设置中启用 GitHub Pages
2. 选择 GitHub Actions 作为源
3. 创建 `.github/workflows/deploy.yml` 工作流文件

## 技术栈

- **Astro 6** - 静态站点生成器
- **TypeScript** - 类型安全
- **Markdown** - 内容编写
- **CSS** - 样式设计

## 贡献

欢迎提交 Issue 和 Pull Request！

## 许可证

MIT License