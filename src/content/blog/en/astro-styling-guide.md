---
title: "Astro Styling Guide"
description: "Deep dive into Astro's styling approaches, including component styles, global styles, CSS modules, Tailwind CSS integration, and other best practices."
pubDate: 2026-06-24
category: "Technology"
tags: ["astro", "css", "styling", "frontend"]
lang: "en"
---

## Styling in Astro

Astro provides multiple ways to handle styles, giving you flexibility in adding styles to your website.

### Component Styles

Astro supports defining styles using `<style>` tags in components. These styles are scoped by default:

```astro
---
// Component script here
const title = "Style Example";
---

<div class="container">
  <h1>{title}</h1>
  <p>This is a styled component.</p>
</div>

<style>
  /* These styles only apply to this component */
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

### Global Styles

If you need to define global styles, you can use the `is:global` directive:

```astro
<style is:global>
  /* These styles will apply globally */
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

### External Style Files

You can also place styles in external files and import them in components:

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
  <h1>Using External Styles</h1>
</div>
```

### CSS Preprocessors

Astro supports various CSS preprocessors like Sass, Less, and Stylus. Just install the appropriate dependency:

```bash
# Install Sass
npm install sass
```

Then use it in your components:

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

Astro also supports Tailwind CSS. First install the dependency:

```bash
npx astro add tailwind
```

Then enable it in the configuration:

```javascript
// astro.config.mjs
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  integrations: [tailwind()],
});
```

Now you can use Tailwind classes in your components:

```astro
<div class="p-4 bg-blue-100 rounded-lg">
  <h2 class="text-2xl font-bold text-blue-800">Tailwind Example</h2>
  <p class="mt-2 text-blue-600">Use Tailwind CSS classes to style components.</p>
</div>
```

### Best Practices

1. **Component styles first** - Use component styles when possible to avoid global style pollution
2. **Use CSS variables** - Define reusable design tokens
3. **Responsive design** - Use media queries for different devices
4. **Performance optimization** - Avoid using too many CSS frameworks

### Summary

Astro provides flexible style handling methods. You can choose the appropriate approach based on project requirements. Whether it's simple component styles or complex CSS frameworks, Astro supports them well.