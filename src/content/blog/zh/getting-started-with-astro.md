---
title: "Astro 入门指南"
description: "从零开始学习 Astro 框架，掌握项目创建、配置、组件开发、内容集合等核心功能。适合初学者的完整教程。"
pubDate: 2026-06-22
category: "教程"
tags: ["astro", "教程", "入门", "前端"]
lang: "zh"
---

## 什么是 Astro？

Astro 是一个现代化的静态站点生成器，专为构建快速、内容驱动的网站而设计。它支持多种前端框架，包括 React、Vue、Svelte 等。

### 核心特性

1. **零 JavaScript 默认** - Astro 默认不发送任何 JavaScript 到客户端
2. **岛屿架构** - 只在需要的地方加载交互式组件
3. **内容集合** - 类型安全的内容管理
4. **多语言支持** - 内置国际化功能

### 安装 Astro

```bash
# 使用 npm
npm create astro@latest

# 使用 yarn
yarn create astro

# 使用 pnpm
pnpm create astro
```

### 项目结构

```
my-astro-site/
├── src/
│   ├── components/     # 可复用组件
│   ├── layouts/        # 布局组件
│   ├── pages/          # 页面路由
│   └── content/        # 内容集合
├── public/             # 静态资源
├── astro.config.mjs    # 配置文件
└── package.json
```

### 创建第一个页面

在 `src/pages/` 目录下创建 `index.astro` 文件：

```astro
---
// 这里是组件脚本（服务器端）
const title = "欢迎来到我的网站";
---

<html>
  <head>
    <title>{title}</title>
  </head>
  <body>
    <h1>{title}</h1>
    <p>这是我的第一个 Astro 页面。</p>
  </body>
</html>
```

### 使用组件

Astro 支持组件化开发。创建一个简单的组件：

```astro
---
// src/components/Greeting.astro
interface Props {
  name: string;
}

const { name } = Astro.props;
---

<div class="greeting">
  <h2>你好，{name}！</h2>
  <p>欢迎来到我的网站。</p>
</div>

<style>
  .greeting {
    padding: 1rem;
    background-color: #f0f8ff;
    border-radius: 8px;
  }
</style>
```

然后在页面中使用：

```astro
---
import Greeting from '../components/Greeting.astro';
---

<Greeting name="访客" />
```

### 常见问题

#### Astro 和 Next.js 有什么区别？

Astro 是一个静态站点生成器，默认不发送 JavaScript 到客户端，适合内容驱动的网站。Next.js 是一个全栈 React 框架，适合需要复杂交互的 Web 应用。

#### Astro 支持哪些前端框架？

Astro 支持 React、Vue、Svelte、Solid、Preact 等多种前端框架，你可以在同一个项目中混合使用它们。

#### Astro 适合什么类型的项目？

Astro 非常适合博客、文档网站、营销页面、个人作品集等以内容为主的网站。对于需要大量客户端交互的应用，可能需要考虑其他方案。

### 下一步

现在你已经了解了 Astro 的基础知识，可以继续学习：

- 内容集合
- 布局系统
- 样式处理
- 部署选项

祝你学习愉快！