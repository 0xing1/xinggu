---
name: seo-content-optimizer
description: 深度分析单页或批量页面的内容质量（E-E-A-T）、技术SEO问题、GEO优化潜力，结合GSC数据或竞品对比，发现低竞争高意图关键词机会。输出结构化优先行动计划、可执行建议与代码片段。面向中文站点优化。
---

# SEO 内容优化器

## 使用方式

```
/seo-content-optimizer [页面路径或URL]
/seo-content-optimizer --batch [目录路径]
/seo-content-optimizer --keyword [关键词]
```

## 分析维度

### 1. 内容质量分析（E-E-A-T）

检查以下要素：

| 要素 | 检查项 | 权重 |
|------|--------|------|
| **Experience（经验）** | 第一手经验、实际案例、个人见解 | 25% |
| **Expertise（专业）** | 技术深度、术语准确性、代码示例 | 25% |
| **Authoritativeness（权威）** | 作者信息、引用来源、外部链接 | 25% |
| **Trustworthiness（可信）** | 更新日期、联系方式、隐私政策 | 25% |

### 2. 技术 SEO 检查

```yaml
标题优化:
  - 长度: 50-60字符
  - 包含目标关键词
  - 品牌名在末尾
  - 唯一性

Meta描述:
  - 长度: 150-160字符
  - 包含行动号召
  - 包含关键词
  - 唯一性

H标签结构:
  - H1: 唯一，包含主关键词
  - H2: 3-5个，覆盖子主题
  - H3: 支撑H2的细节
  - 层级清晰，无跳跃

图片优化:
  - alt属性: 描述性，含关键词
  - 文件名: 语义化
  - 尺寸: 适当压缩
  - 格式: WebP优先

Schema标记:
  - Article/BlogPosting
  - FAQ/HowTo（如适用）
  - BreadcrumbList
  - Organization/Person

内链结构:
  - 相关文章链接
  - 锚文本多样性
  - 链接深度合理
```

### 3. GEO/AEO 优化（生成式引擎优化）

```yaml
问题式标题:
  - 包含"如何"、"什么是"、"为什么"
  - 匹配用户搜索意图
  - 适合AI提取答案

段落可引用性:
  - 开头直接回答问题
  - 段落长度适中（40-60字）
  - 使用列表和表格
  - 定义清晰的概念

归因密度:
  - 引用权威来源
  - 提供数据支撑
  - 标注信息来源
  - 链接到原始出处
```

### 4. 关键词机会分析

从内容中提取潜在关键词机会：

```yaml
低竞争关键词:
  - 当前排名: 4-20位
  - 搜索量: 中等
  - 竞争度: 低
  - 意图: 信息型/交易型

长尾关键词:
  - 问题式查询
  - 比较型查询
  - 具体场景查询
  - 地域性查询
```

## 输出格式

### 总体评分

```
┌─────────────────────────────────────────────────────────┐
│                    SEO 内容评分卡                        │
├─────────────────────────────────────────────────────────┤
│  总体评分: 72/100                                       │
│                                                         │
│  内容质量:  ████████░░  65/100                          │
│  技术SEO:   █████████░  85/100                          │
│  GEO优化:   ███████░░░  70/100                          │
│  关键词:    ██████░░░░  60/100                          │
└─────────────────────────────────────────────────────────┘
```

### 优先级行动计划

```markdown
## 🔴 Critical（立即修复）

### 问题 1: [问题标题]
- **问题**: [具体描述]
- **影响**: [对排名/流量的影响]
- **修复**: [具体步骤]
- **预期提升**: [量化预期]
- **验证**: [如何验证修复成功]

## 🟡 High（本周完成）

### 问题 2: [问题标题]
...

## 🟢 Medium（本月完成）

### 问题 3: [问题标题]
...

## ⚪ Low（有空再做）

### 问题 4: [问题标题]
...
```

### 优化建议

```markdown
## 标题优化建议

当前标题: [原标题]
建议标题: [新标题]
理由: [为什么这样改]

## Meta描述优化

当前描述: [原描述]
建议描述: [新描述]
理由: [为什么这样改]

## H标签结构建议

H1: [建议H1]
├── H2: [建议H2-1]
│   ├── H3: [建议H3-1]
│   └── H3: [建议H3-2]
├── H2: [建议H2-2]
└── H2: [建议H2-3]

## 内容大纲

1. [章节1] - [关键词] - [字数建议]
2. [章节2] - [关键词] - [字数建议]
3. ...
```

### 本周可执行清单

```markdown
## 📋 本周可执行清单（ROI最高）

- [ ] **任务1**: [具体动作]
  - 预期效果: [量化]
  - 所需时间: [时间]
  - 优先级: [Critical/High/Medium]

- [ ] **任务2**: [具体动作]
  - 预期效果: [量化]
  - 所需时间: [时间]
  - 优先级: [Critical/High/Medium]

- [ ] **任务3**: [具体动作]
  - 预期效果: [量化]
  - 所需时间: [时间]
  - 优先级: [Critical/High/Medium]
```

## 代码片段模板

### Article Schema

```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "文章标题",
  "description": "文章描述",
  "image": "https://example.com/image.jpg",
  "datePublished": "2026-06-26T00:00:00Z",
  "dateModified": "2026-06-26T00:00:00Z",
  "author": {
    "@type": "Person",
    "name": "作者名",
    "url": "https://example.com/about"
  },
  "publisher": {
    "@type": "Organization",
    "name": "站点名",
    "logo": {
      "@type": "ImageObject",
      "url": "https://example.com/logo.png"
    }
  },
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": "https://example.com/article-url"
  }
}
```

### FAQ Schema

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "问题1？",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "答案1"
      }
    }
  ]
}
```

### BreadcrumbList Schema

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "首页",
      "item": "https://example.com"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "博客",
      "item": "https://example.com/blog"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "文章标题",
      "item": "https://example.com/blog/article"
    }
  ]
}
```

## 中文站点特殊优化

### 中文标题优化

```
✅ 好的标题:
- "2026年Astro 6完整教程：从零搭建高性能博客"
- "Vue 3 vs React 18：哪个更适合你的下一个项目？"
- "如何用TypeScript提升代码质量：5个实用技巧"

❌ 不好的标题:
- "Astro教程"（太短，没有差异化）
- "Vue和React的比较"（缺乏具体性）
- "TypeScript技巧"（没有价值承诺）
```

### 中文内容结构

```markdown
# 主标题（H1）- 包含核心关键词

> 一句话摘要：直接回答用户最关心的问题

## 什么是XXX？（H2）- 定义和概念
[40-60字的简洁定义]

## 为什么选择XXX？（H2）- 价值和优势
- 优势1
- 优势2
- 优势3

## 如何使用XXX？（H2）- 实操步骤
### 步骤1：准备工作（H3）
### 步骤2：核心配置（H3）
### 步骤3：高级用法（H3）

## 常见问题（H2）- FAQ
### Q1：XXX和YYY有什么区别？
### Q2：XXX适合什么场景？

## 总结（H2）- 核心要点回顾
```

## 使用示例

### 分析单个页面

```
用户: /seo-content-optimizer src/content/blog/zh/getting-started-with-astro.md

输出:
1. 读取文件内容
2. 分析 frontmatter（标题、描述、标签、日期）
3. 检查内容结构（H标签、段落、列表、代码块）
4. 评估 E-E-A-T 各维度
5. 生成优化建议
6. 输出评分卡和行动计划
```

### 批量分析

```
用户: /seo-content-optimizer --batch src/content/blog/zh/

输出:
1. 扫描目录下所有 .md 文件
2. 逐个分析并评分
3. 汇总统计
4. 识别共性问题
5. 输出批量优化建议
```

### 关键词分析

```
用户: /seo-content-optimizer --keyword "Astro框架"

输出:
1. 分析当前内容中该关键词的使用
2. 评估关键词密度和位置
3. 识别相关长尾关键词
4. 建议内容扩展方向
5. 输出关键词优化建议
```
