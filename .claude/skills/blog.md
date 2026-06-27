---
name: blog
description: Blog management skill for creating, listing, editing, and deleting blog posts
---

# Blog Management Skill

This skill provides commands to manage blog posts in the Astro blog project.

## Commands

### /blog new

Create a new blog post with interactive prompts.

**Usage:** `/blog new`

**Behavior:**
1. Ask for the post language (zh/en)
2. Ask for the post title
3. Ask for the post description
4. Ask for the category
5. Ask for tags (comma-separated)
6. Generate a slug from the title
7. Create the markdown file with frontmatter
8. Open the file for editing

**Implementation:**
When the user invokes `/blog new`, execute the following steps:

1. Use `AskUserQuestion` to gather post information:
   - Language selection (zh/en)
   - Title
   - Description
   - Category
   - Tags

2. Generate the filename from the title:
   - Convert to lowercase
   - Replace spaces with hyphens
   - Remove special characters
   - Add `.md` extension

3. Create the markdown file with frontmatter:

```markdown
---
title: "{title}"
description: "{description}"
pubDate: {YYYY-MM-DD}
category: "{category}"
tags: [{tags}]
lang: "{lang}"
---

## {title}

Write your content here...
```

4. Save the file to `src/content/blog/{lang}/{filename}.md`
5. Confirm the creation and show the file path

---

### /blog list

List all blog posts with their metadata.

**Usage:** `/blog list [options]`

**Options:**
- `--lang=zh|en` - Filter by language
- `--category=<name>` - Filter by category
- `--tag=<name>` - Filter by tag
- `--sort=date|title` - Sort order (default: date)

**Behavior:**
1. Read all blog posts from `src/content/blog/`
2. Parse frontmatter to extract metadata
3. Apply filters if specified
4. Display posts in a formatted table

**Implementation:**
When the user invokes `/blog list`, execute the following steps:

1. Use `Glob` to find all markdown files in `src/content/blog/`
2. Read each file and parse frontmatter
3. Apply any filters from the command options
4. Display results in a table format:

```
| Slug | Title | Language | Category | Tags | Date |
|------|-------|----------|----------|------|------|
| hello-world | Hello World | en | Technology | astro, blog | 2024-01-15 |
```

---

### /blog edit [slug]

Edit an existing blog post.

**Usage:** `/blog edit <slug>`

**Arguments:**
- `slug` - The slug of the post to edit (filename without .md)

**Behavior:**
1. Find the post file by slug
2. Display current content
3. Ask what to edit (title, description, content, etc.)
4. Apply changes
5. Save the file

**Implementation:**
When the user invokes `/blog edit <slug>`, execute the following steps:

1. Search for the file in `src/content/blog/` directories
2. If not found, show error message
3. If found, read the file content
4. Use `AskUserQuestion` to ask what to edit:
   - Frontmatter only
   - Content only
   - Both
5. For frontmatter edits, use `AskUserQuestion` for each field
6. Apply changes using `Edit` tool
7. Confirm the changes

---

### /blog delete [slug]

Delete a blog post.

**Usage:** `/blog delete <slug>`

**Arguments:**
- `slug` - The slug of the post to delete (filename without .md)

**Behavior:**
1. Find the post file by slug
2. Confirm deletion with user
3. Delete the file
4. Confirm deletion

**Implementation:**
When the user invokes `/blog delete <slug>`, execute the following steps:

1. Search for the file in `src/content/blog/` directories
2. If not found, show error message
3. If found, read the file to show preview
4. Use `AskUserQuestion` to confirm deletion
5. If confirmed, use `Bash` to delete the file: `rm <filepath>`
6. Confirm the deletion

---

## Helper Functions

### Generate Slug from Title

Convert a title to a URL-friendly slug:

```javascript
function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')  // Remove special characters
    .replace(/\s+/g, '-')      // Replace spaces with hyphens
    .replace(/-+/g, '-')       // Remove consecutive hyphens
    .trim();
}
```

### Parse Frontmatter

Extract frontmatter from markdown file:

```javascript
function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return null;

  const frontmatter = {};
  const lines = match[1].split('\n');

  lines.forEach(line => {
    const [key, ...valueParts] = line.split(':');
    if (key && valueParts.length) {
      const value = valueParts.join(':').trim();
      frontmatter[key.trim()] = value;
    }
  });

  return frontmatter;
}
```

### Format Date

Format date for frontmatter:

```javascript
function formatDate(date) {
  return date.toISOString().split('T')[0]; // YYYY-MM-DD
}
```

---

## Error Handling

- **File not found:** Show message "Post with slug '{slug}' not found."
- **Invalid language:** Show message "Invalid language. Use 'zh' or 'en'."
- **Missing required fields:** Show message "Title and description are required."
- **File already exists:** Show message "Post with this slug already exists."

---

## Examples

### Create a new post

```
/blog new

> What language? (zh/en): en
> Title: My New Post
> Description: A description of my post
> Category: Technology
> Tags: astro, web, tutorial

✓ Created: src/content/blog/en/my-new-post.md
```

### List posts

```
/blog list

| Slug | Title | Language | Category | Tags | Date |
|------|-------|----------|----------|------|------|
| hello-world | Hello World | en | Technology | astro, blog | 2024-01-15 |
| getting-started | Getting Started | en | Tutorial | astro, tutorial | 2024-01-20 |
```

### Edit a post

```
/blog edit hello-world

> What do you want to edit?
  1. Frontmatter only
  2. Content only
  3. Both

> Select: 1

> Title (current: Hello World): Hello World Updated
> Description (current: My first post): My updated first post

✓ Updated: src/content/blog/en/hello-world.md
```

### Delete a post

```
/blog delete hello-world

> Are you sure you want to delete "Hello World"? (y/n): y

✓ Deleted: src/content/blog/en/hello-world.md
```