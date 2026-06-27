---
title: "你好世界"
description: "了解如何使用 Astro 6 搭建现代化博客，包括零 JavaScript、岛屿架构、内容集合等核心特性。这是我的第一篇博客文章。"
pubDate: 2026-06-20
category: "技术"
tags: ["astro", "博客", "入门"]
lang: "zh"
---

## 欢迎来到我的博客

这是使用 Astro 构建的博客的第一篇文章。Astro 是一个现代化的静态站点生成器，非常适合构建博客、文档网站和营销页面。

### 为什么选择 Astro？

Astro 有几个显著的优势：

1. **零 JavaScript 默认** - 页面默认不发送任何 JavaScript 到客户端
2. **岛屿架构** - 只在需要的地方加载交互式组件
3. **内容集合** - 类型安全的内容管理
4. **多语言支持** - 内置国际化功能

### 开始使用

要创建一个新的 Astro 项目，你可以运行：

```bash
npm create astro@latest
```

然后按照提示进行操作。Astro 支持多种模板，包括博客、文档和最小配置。

### 内容集合

Astro 的内容集合功能非常强大。你可以在 `src/content` 目录中组织你的内容，并使用 TypeScript 定义数据模式。

```typescript
import { defineCollection, z } from 'astro:content';

const blogCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
  }),
});

export const collections = {
  blog: blogCollection,
};
```

### 多语言支持

Astro 6 提供了出色的国际化支持。你可以轻松地为不同语言创建路由和内容。

在配置文件中，你可以这样设置：

```javascript
export default defineConfig({
  i18n: {
    defaultLocale: 'zh',
    locales: ['zh', 'en'],
  },
});
```

### 下一步

在接下来的文章中，我将深入探讨 Astro 的更多功能，包括：

- 组件开发
- 样式处理
- 部署选项
- 性能优化

感谢阅读！如果你有任何问题，欢迎在评论区留言。