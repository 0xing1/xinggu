---
name: blog-manage
description: Comprehensive blog management skill with commands for creating, listing, editing, and deleting posts
---

# Blog Management Skill

This skill provides a complete set of commands to manage blog posts in the Astro blog project.

## Quick Start

```bash
# Create a new post
/blog new

# List all posts
/blog list

# List posts by language
/blog list --lang=zh

# Edit a post
/blog edit hello-world

# Delete a post
/blog delete hello-world
```

## Commands

### 1. Create New Post (`/blog new`)

Creates a new blog post with interactive prompts.

**Interactive Steps:**
1. Select language (zh/en)
2. Enter title
3. Enter description
4. Enter category
5. Enter tags (comma-separated)

**Generated File Structure:**
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

Write your content here...
```

**File Location:**
- Chinese: `src/content/blog/zh/{slug}.md`
- English: `src/content/blog/en/{slug}.md`

---

### 2. List Posts (`/blog list`)

Lists all blog posts with metadata.

**Options:**
| Option | Description | Example |
|--------|-------------|---------|
| `--lang` | Filter by language | `--lang=zh` |
| `--category` | Filter by category | `--category=Technology` |
| `--tag` | Filter by tag | `--tag=astro` |
| `--sort` | Sort by date or title | `--sort=title` |

**Output Format:**
```
| Slug | Title | Lang | Category | Tags | Date |
|------|-------|------|----------|------|------|
| hello-world | Hello World | en | Technology | astro, blog | 2024-01-15 |
```

---

### 3. Edit Post (`/blog edit [slug]`)

Edits an existing blog post.

**Usage:**
```bash
/blog edit hello-world
```

**Edit Options:**
1. **Frontmatter only** - Edit title, description, category, tags
2. **Content only** - Open content in editor
3. **Both** - Edit frontmatter and content

**Frontmatter Fields:**
- `title` - Post title
- `description` - Post description
- `pubDate` - Publication date (YYYY-MM-DD)
- `category` - Post category
- `tags` - Post tags (array format)
- `lang` - Language (zh/en)

---

### 4. Delete Post (`/blog delete [slug]`)

Deletes a blog post with confirmation.

**Usage:**
```bash
/blog delete hello-world
```

**Safety Features:**
- Shows post title before deletion
- Requires confirmation (y/n)
- Cannot be undone

---

## Implementation Details

### File Structure

```
.claude/skills/
├── blog.md              # Skill documentation
├── blog.sh              # Main implementation script
└── blog-wrapper.sh      # Wrapper for easy execution
```

### Script Functions

#### `blog_new()`
- Prompts for post details
- Generates slug from title
- Creates markdown file with frontmatter
- Validates input

#### `blog_list()`
- Reads all markdown files
- Parses frontmatter
- Applies filters
- Formats output as table

#### `blog_edit()`
- Finds post by slug
- Shows current content
- Allows selective editing
- Updates file

#### `blog_delete()`
- Finds post by slug
- Shows post preview
- Confirms deletion
- Removes file

### Helper Functions

#### `generate_slug(title)`
Converts title to URL-friendly slug:
```bash
# Input: "Hello World Example"
# Output: "hello-world-example"
```

#### `parse_frontmatter(content)`
Extracts frontmatter fields from markdown:
```bash
# Returns: title, description, pubDate, category, tags, lang
```

---

## Error Handling

| Error | Message | Solution |
|-------|---------|----------|
| Post not found | "Post with slug '{slug}' not found." | Check slug spelling |
| Invalid language | "Invalid language. Use 'zh' or 'en'." | Use zh or en |
| Missing fields | "Title and description are required." | Fill required fields |
| File exists | "Post with this slug already exists." | Use different title |

---

## Examples

### Example 1: Create a Technology Post

```bash
$ /blog new

What language? (zh/en): en
Title: Introduction to Astro
Description: Learn the basics of Astro framework
Category: Technology
Tags: astro, javascript, web

✓ Created: src/content/blog/en/introduction-to-astro.md
```

### Example 2: List Chinese Posts

```bash
$ /blog list --lang=zh

| Slug | Title | Lang | Category | Tags | Date |
|------|-------|------|----------|------|------|
| hello-world | 你好世界 | zh | 技术 | astro, 博客 | 2024-01-15 |
| getting-started | 入门指南 | zh | 教程 | astro, 教程 | 2024-01-20 |
```

### Example 3: Edit Post Category

```bash
$ /blog edit hello-world

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

### Example 4: Delete a Post

```bash
$ /blog delete hello-world

Are you sure you want to delete "Hello World"? (y/n): y

✓ Deleted: src/content/blog/en/hello-world.md
```

---

## Integration with Astro

This skill is designed to work with the Astro blog project structure:

```
astro-blog/
├── src/
│   └── content/
│       └── blog/
│           ├── zh/        # Chinese posts
│           └── en/        # English posts
├── .claude/
│   └── skills/
│       └── blog.sh        # This skill
└── ...
```

### Content Collections

Posts created with this skill are compatible with Astro's content collections:

```typescript
// src/content.config.ts
const blogCollection = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    category: z.string().optional(),
    tags: z.array(z.string()).default([]),
    lang: z.enum(['zh', 'en']).default('zh'),
  }),
});
```

---

## Best Practices

1. **Use descriptive titles** - Makes posts easier to find
2. **Add categories** - Helps organize content
3. **Use relevant tags** - Improves discoverability
4. **Write good descriptions** - Helps with SEO
5. **Keep slugs short** - Better URLs

---

## Troubleshooting

### Issue: Command not found
**Solution:** Ensure scripts are executable
```bash
chmod +x .claude/skills/blog.sh
chmod +x .claude/skills/blog-wrapper.sh
```

### Issue: Posts not showing in build
**Solution:** Check frontmatter format
```bash
# Ensure proper YAML syntax
title: "Title"  # Use quotes for strings with special chars
tags: ["tag1", "tag2"]  # Use array format for tags
```

### Issue: Slug generation issues
**Solution:** Manual slug override
```bash
# If auto-generated slug is wrong, rename the file
mv src/content/blog/en/wrong-slug.md src/content/blog/en/correct-slug.md
```