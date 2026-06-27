---
title: "Astro 样式指南"
description: "深入了解 Astro 的样式处理方式，包括组件样式、全局样式、CSS 模块、Tailwind CSS 集成等最佳实践。"
pubDate: 2026-06-24
category: "技术"
tags: ["astro", "css", "样式", "前端"]
lang: "zh"
---

## Astro 中的样式处理

Astro 提供了多种处理样式的方式，让你可以灵活地为网站添加样式。

### 组件样式

Astro 支持在组件中使用 `<style>` 标签定义样式。这些样式默认是作用域隔离的：

```astro
---
// 这里是组件脚本
const title = "样式示例";
---

<div class="container">
  <h1>{title}</h1>
  <p>这是一个带样式的组件。</p>
</div>

<style>
  /* 这些样式只作用于当前组件 */
  .container {
    padding: 2rem;
    background-color: #f8f9fa;
    border-radius: 8px;
  }

  h1 {
    color: #1a1a1a;
    font-size: 2rem;
  }

  p {
    color: #666;
    line-height: 1.6;
  }
</style>
```

### 全局样式

如果你需要定义全局样式，可以使用 `is:global` 指令：

```astro
<style is:global>
  /* 这些样式会应用到全局 */
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    line-height: 1.6;
    color: #333;
  }

  a {
    color: #007acc;
    text-decoration: none;
  }

  a:hover {
    text-decoration: underline;
  }
</style>
```

### 外部样式文件

你也可以将样式放在外部文件中，然后在组件中导入：

```css
/* src/styles/global.css */
body {
  margin: 0;
  padding: 0;
  font-family: system-ui, sans-serif;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}
```

```astro
---
import '../styles/global.css';
---

<div class="container">
  <h1>使用外部样式</h1>
</div>
```

### CSS 预处理器

Astro 支持多种 CSS 预处理器，如 Sass、Less 和 Stylus。只需安装相应的依赖：

```bash
# 安装 Sass
npm install sass
```

然后在组件中使用：

```astro
<style lang="scss">
  $primary-color: #007acc;
  $spacing: 1rem;

  .button {
    background-color: $primary-color;
    padding: $spacing;
    border-radius: 4px;

    &:hover {
      background-color: darken($primary-color, 10%);
    }
  }
</style>
```

### Tailwind CSS

Astro 也支持 Tailwind CSS。首先安装依赖：

```bash
npx astro add tailwind
```

然后在配置中启用：

```javascript
// astro.config.mjs
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  integrations: [tailwind()],
});
```

现在你可以在组件中使用 Tailwind 类：

```astro
<div class="p-4 bg-blue-100 rounded-lg">
  <h2 class="text-2xl font-bold text-blue-800">Tailwind 示例</h2>
  <p class="mt-2 text-blue-600">使用 Tailwind CSS 类来样式化组件。</p>
</div>
```

### 最佳实践

1. **组件样式优先** - 尽量使用组件样式，避免全局样式污染
2. **使用 CSS 变量** - 定义可复用的设计令牌
3. **响应式设计** - 使用媒体查询适配不同设备
4. **性能优化** - 避免使用过多的 CSS 框架

### 总结

Astro 提供了灵活的样式处理方式，你可以根据项目需求选择合适的方法。无论是简单的组件样式还是复杂的 CSS 框架，Astro 都能很好地支持。