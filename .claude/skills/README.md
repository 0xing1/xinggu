# Blog Management Skill

This directory contains the blog management skill for the Astro blog project.

## Files

- `blog.md` - Skill documentation and specification
- `blog-manage.md` - Comprehensive documentation with examples
- `blog.sh` - Main implementation script
- `blog-wrapper.sh` - Wrapper script for easy execution

## Quick Start

### Using the blog command (recommended)

From the project root directory:

```bash
# Create a new post
./blog new

# List all posts
./blog list

# List posts by language
./blog list --lang=zh
./blog list --lang=en

# List posts by category
./blog list --category=Technology

# List posts by tag
./blog list --tag=astro

# Edit a post
./blog edit hello-world

# Delete a post
./blog delete hello-world
```

### Using bash directly

```bash
# Create a new post
bash .claude/skills/blog.sh new

# List all posts
bash .claude/skills/blog.sh list

# Edit a post
bash .claude/skills/blog.sh edit hello-world

# Delete a post
bash .claude/skills/blog.sh delete hello-world
```

## Commands

### `/blog new`

Create a new blog post with interactive prompts.

**Steps:**
1. Select language (zh/en)
2. Enter title
3. Enter description
4. Enter category
5. Enter tags (comma-separated)

**Example:**
```bash
$ ./blog new

What language? (zh/en): en
Title: My New Post
Description: A description of my post
Category: Technology
Tags: astro, web, tutorial

✓ Created: src/content/blog/en/my-new-post.md
```

### `/blog list`

List all blog posts with metadata.

**Options:**
- `--lang=zh|en` - Filter by language
- `--category=<name>` - Filter by category
- `--tag=<name>` - Filter by tag
- `--sort=date|title` - Sort order (default: date)

**Example:**
```bash
$ ./blog list --lang=en

| Slug | Title | Lang | Category | Tags | Date |
|------|-------|------|----------|------|------|
| hello-world | Hello World | en | Technology | astro, blog | 2024-01-15 |
```

### `/blog edit [slug]`

Edit an existing blog post.

**Usage:**
```bash
./blog edit hello-world
```

**Edit Options:**
1. Frontmatter only
2. Content only
3. Both

### `/blog delete [slug]`

Delete a blog post with confirmation.

**Usage:**
```bash
./blog delete hello-world
```

**Safety:**
- Shows post title before deletion
- Requires confirmation (y/n)

## File Structure

```
.claude/skills/
├── README.md                  # This file
├── blog.md                    # Blog skill specification
├── blog-manage.md             # Blog comprehensive documentation
├── blog.sh                    # Blog main implementation
├── blog-wrapper.sh            # Blog wrapper script
└── seo-content-optimizer.md   # SEO content optimizer skill
```

## Post File Structure

Posts are stored in:
- Chinese: `src/content/blog/zh/{slug}.md`
- English: `src/content/blog/en/{slug}.md`

### Frontmatter Format

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

## Error Handling

| Error | Message | Solution |
|-------|---------|----------|
| Post not found | "Post with slug '{slug}' not found." | Check slug spelling |
| Invalid language | "Invalid language. Use 'zh' or 'en'." | Use zh or en |
| Missing fields | "Title and description are required." | Fill required fields |
| File exists | "Post with this slug already exists." | Use different title |

## Troubleshooting

### Command not found

Ensure scripts are executable:
```bash
chmod +x .claude/skills/blog.sh
chmod +x .claude/skills/blog-wrapper.sh
chmod +x blog
```

### Posts not showing in build

Check frontmatter format:
```bash
# Ensure proper YAML syntax
title: "Title"  # Use quotes for strings with special chars
tags: ["tag1", "tag2"]  # Use array format for tags
```

### Slug generation issues

If auto-generated slug is wrong, rename the file:
```bash
mv src/content/blog/en/wrong-slug.md src/content/blog/en/correct-slug.md
```

## Integration with Astro

This skill works with Astro's content collections:

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

## Best Practices

1. **Use descriptive titles** - Makes posts easier to find
2. **Add categories** - Helps organize content
3. **Use relevant tags** - Improves discoverability
4. **Write good descriptions** - Helps with SEO
5. **Keep slugs short** - Better URLs

---

## SEO Content Optimizer Skill

深度分析页面的 SEO 质量，提供优化建议。

### 使用方式

```bash
# 分析单个页面
/seo-content-optimizer src/content/blog/zh/getting-started-with-astro.md

# 批量分析
/seo-content-optimizer --batch src/content/blog/zh/

# 关键词分析
/seo-content-optimizer --keyword "Astro框架"
```

### 分析维度

1. **内容质量（E-E-A-T）**
   - Experience（经验）：第一手经验、实际案例
   - Expertise（专业）：技术深度、代码示例
   - Authoritativeness（权威）：引用来源、外部链接
   - Trustworthiness（可信）：更新日期、联系方式

2. **技术 SEO**
   - 标题、Meta、H标签结构
   - 内链、图片alt、Schema标记
   - Core Web Vitals 信号

3. **GEO/AEO 优化**
   - 问题式标题
   - 段落可引用性
   - 归因密度

4. **关键词机会**
   - 低竞争高意图关键词
   - 长尾关键词建议

### 输出

- 总体评分（0-100）
- 优先级行动计划（Critical / High / Medium / Low）
- 优化后的标题、Meta、H标签建议
- 本周可执行清单

### 优化规则

1. 所有 SEO 审计使用 plan 模式（只读分析）
2. 每次优化一个具体问题，一个 commit 解决一个问题
3. 优化前先展示 diff，获得批准后再实施
4. 优化后运行 `npm run build` 验证
5. 优先级：影响页数最多的问题优先解决

## Examples

### Create a Technology Post

```bash
$ ./blog new

What language? (zh/en): en
Title: Introduction to Astro
Description: Learn the basics of Astro framework
Category: Technology
Tags: astro, javascript, web

✓ Created: src/content/blog/en/introduction-to-astro.md
```

### List Chinese Posts

```bash
$ ./blog list --lang=zh

| Slug | Title | Lang | Category | Tags | Date |
|------|-------|------|----------|------|------|
| hello-world | 你好世界 | zh | 技术 | astro, 博客 | 2024-01-15 |
```

### Edit Post Category

```bash
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

### Delete a Post

```bash
$ ./blog delete hello-world

Are you sure you want to delete "Hello World"? (y/n): y

✓ Deleted: src/content/blog/en/hello-world.md
```