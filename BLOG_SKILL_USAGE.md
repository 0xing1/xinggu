# Blog Management Skill - Usage Guide

This document provides a quick guide on how to use the blog management skill.

## Quick Start

### 1. Create a New Post

```bash
./blog new
```

This will guide you through creating a new blog post:

```
$ ./blog new

What language? (zh/en): en
Title: My New Post
Description: A description of my post
Category: Technology
Tags: astro, web, tutorial

✓ Created: src/content/blog/en/my-new-post.md
```

### 2. List All Posts

```bash
./blog list
```

This will show all blog posts in a table format:

```
| Slug | Title | Lang | Category | Tags | Date |
|------|-------|------|----------|------|------|
| hello-world | Hello World | en | Technology | astro, blog | 2024-01-15 |
| getting-started | Getting Started | en | Tutorial | astro, tutorial | 2024-01-20 |
```

### 3. Filter Posts

```bash
# Filter by language
./blog list --lang=zh

# Filter by category
./blog list --category=Technology

# Filter by tag
./blog list --tag=astro

# Sort by title
./blog list --sort=title
```

### 4. Edit a Post

```bash
./blog edit hello-world
```

This will show edit options:

```
$ ./blog edit hello-world

What do you want to edit?
  1. Frontmatter only
  2. Content only
  3. Both

Select: 1

Title (current: Hello World): 
Description (current: My first post): 
Category (current: Technology): Web Development
Tags (current: ["astro", "blog"]): 

✓ Frontmatter updated.
```

### 5. Delete a Post

```bash
./blog delete hello-world
```

This will ask for confirmation:

```
$ ./blog delete hello-world

Are you sure you want to delete "Hello World"? (y/n): y

✓ Deleted: src/content/blog/en/hello-world.md
```

## Command Reference

| Command | Description | Example |
|---------|-------------|---------|
| `./blog new` | Create a new post | `./blog new` |
| `./blog list` | List all posts | `./blog list` |
| `./blog list --lang=zh` | List Chinese posts | `./blog list --lang=zh` |
| `./blog list --category=Tech` | Filter by category | `./blog list --category=Technology` |
| `./blog list --tag=astro` | Filter by tag | `./blog list --tag=astro` |
| `./blog edit <slug>` | Edit a post | `./blog edit hello-world` |
| `./blog delete <slug>` | Delete a post | `./blog delete hello-world` |

## File Locations

Posts are stored in:

- **Chinese posts:** `src/content/blog/zh/`
- **English posts:** `src/content/blog/en/`

## Post Format

Each post has the following frontmatter:

```markdown
---
title: "Post Title"
description: "Post description"
pubDate: 2024-01-25
category: "Category"
tags: ["tag1", "tag2"]
lang: "en"
---

## Post Title

Content goes here...
```

## Examples

### Example 1: Create a Chinese Post

```bash
$ ./blog new

What language? (zh/en): zh
标题: 我的第一篇文章
描述: 这是我的第一篇博客文章
分类: 技术
标签: astro, 博客, 入门

✓ 创建成功: src/content/blog/zh/我的第一篇文章.md
```

### Example 2: List All Technology Posts

```bash
$ ./blog list --category=Technology

| Slug | Title | Lang | Category | Tags | Date |
|------|-------|------|----------|------|------|
| hello-world | Hello World | en | Technology | astro, blog | 2024-01-15 |
| astro-styling-guide | Astro Styling Guide | en | Technology | astro, css | 2024-01-25 |
```

### Example 3: Edit Post Tags

```bash
$ ./blog edit hello-world

What do you want to edit?
  1. Frontmatter only
  2. Content only
  3. Both

Select: 1

Title (current: Hello World): 
Description (current: My first post): 
Category (current: Technology): 
Tags (current: ["astro", "blog"]): ["astro", "blog", "tutorial"]

✓ Frontmatter updated.
```

### Example 4: Delete a Post

```bash
$ ./blog delete hello-world

Are you sure you want to delete "Hello World"? (y/n): y

✓ Deleted: src/content/blog/en/hello-world.md
```

## Troubleshooting

### Issue: Command not found

**Solution:** Make sure the script is executable:

```bash
chmod +x blog
chmod +x .claude/skills/blog.sh
```

### Issue: Post not showing in list

**Solution:** Check if the post has correct frontmatter:

```bash
cat src/content/blog/en/your-post.md
```

Ensure it has all required fields: title, description, pubDate, lang

### Issue: Cannot delete post

**Solution:** Make sure you're using the correct slug:

```bash
./blog list  # Find the correct slug
./blog delete correct-slug
```

## Tips

1. **Use descriptive titles** - Makes posts easier to find
2. **Add categories** - Helps organize content
3. **Use relevant tags** - Improves discoverability
4. **Write good descriptions** - Helps with SEO
5. **Keep slugs short** - Better URLs

## Integration with Astro

Posts created with this skill are automatically compatible with Astro's content collections. After creating posts, rebuild the site:

```bash
npm run build
```

The posts will appear in the blog list and can be accessed at:

- English: `/blog/{slug}`
- Chinese: `/blog/{slug}` (same URL, different content based on language)

## Support

For issues or questions:

1. Check the troubleshooting section above
2. Review the skill documentation in `.claude/skills/blog-manage.md`
3. Check the README in `.claude/skills/README.md`