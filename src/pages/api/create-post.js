import fs from 'fs';
import path from 'path';

export async function POST({ request }) {
  try {
    const data = await request.json();
    const { title, description, lang, category, tags, content } = data;

    // 验证必填字段
    if (!title || !description || !content) {
      return new Response(JSON.stringify({
        success: false,
        message: '标题、描述和内容为必填项'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 生成 slug
    const slug = title
      .toLowerCase()
      .replace(/[^\w一-龥]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .substring(0, 50);

    // 处理标签
    const tagsArray = tags
      ? tags.split(/[,，]/).map(t => t.trim()).filter(Boolean)
      : [];

    // 生成文件内容
    const fileContent = `---
title: "${title.replace(/"/g, '\\"')}"
description: "${description.replace(/"/g, '\\"')}"
pubDate: ${new Date().toISOString().split('T')[0]}
${category ? `category: "${category}"` : ''}
tags: [${tagsArray.map(t => `"${t}"`).join(', ')}]
lang: "${lang || 'zh'}"
---

${content}
`;

    // 确定文件路径
    const rootDir = process.cwd();
    const filePath = path.join(rootDir, 'src', 'content', 'blog', lang || 'zh', `${slug}.md`);

    // 确保目录存在
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // 检查文件是否已存在
    if (fs.existsSync(filePath)) {
      return new Response(JSON.stringify({
        success: false,
        message: '同名文章已存在'
      }), {
        status: 409,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 写入文件
    fs.writeFileSync(filePath, fileContent, 'utf8');

    return new Response(JSON.stringify({
      success: true,
      message: '文章创建成功',
      path: filePath,
      slug
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      message: `创建失败: ${error.message}`
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
