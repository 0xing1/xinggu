---
title: "Getting Started with Astro"
description: "Start learning the Astro framework from scratch, mastering project creation, configuration, component development, content collections, and other core features. A complete tutorial for beginners."
pubDate: 2026-06-22
category: "Tutorial"
tags: ["astro", "tutorial", "getting-started", "frontend"]
lang: "en"
---

## What is Astro?

Astro is a modern static site generator designed for building fast, content-driven websites. It supports multiple frontend frameworks including React, Vue, Svelte, and more.

### Core Features

1. **Zero JavaScript by default** - Astro doesn't send any JavaScript to the client by default
2. **Islands Architecture** - Only loads interactive components where needed
3. **Content Collections** - Type-safe content management
4. **Multi-language Support** - Built-in internationalization features

### Installing Astro

```bash
# Using npm
npm create astro@latest

# Using yarn
yarn create astro

# Using pnpm
pnpm create astro
```

### Project Structure

```
my-astro-site/
├── src/
│   ├── components/     # Reusable components
│   ├── layouts/        # Layout components
│   ├── pages/          # Page routes
│   └── content/        # Content collections
├── public/             # Static assets
├── astro.config.mjs    # Configuration file
└── package.json
```

### Creating Your First Page

Create an `index.astro` file in the `src/pages/` directory:

```astro
---
// This is the component script (server-side)
const title = "Welcome to My Website";
---

<html>
  <head>
    <title>{title}</title>
  </head>
  <body>
    <h1>{title}</h1>
    <p>This is my first Astro page.</p>
  </body>
</html>
```

### Using Components

Astro supports component-based development. Create a simple component:

```astro
---
// src/components/Greeting.astro
interface Props {
  name: string;
}

const { name } = Astro.props;
---

<div class="greeting">
  <h2>Hello, {name}!</h2>
  <p>Welcome to my website.</p>
</div>

<style>
  .greeting {
    padding: 1rem;
    background-color: #f0f8ff;
    border-radius: 8px;
  }
</style>
```

Then use it in your page:

```astro
---
import Greeting from '../components/Greeting.astro';
---

<Greeting name="Visitor" />
```

### Next Steps

Now that you understand the basics of Astro, you can continue learning:

- Content Collections
- Layout System
- Styling Approaches
- Deployment Options

Happy learning!