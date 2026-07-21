import fs from 'fs';
import path from 'path';

const STATE_PATH = path.join(process.cwd(), 'scripts', '.sub-state.json');
const SOURCES_PATH = path.join(process.cwd(), 'scripts', 'sub-sources.json');

// ---------- HTTP 请求 ----------

async function httpGet(url, headers = {}, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'sub-crawler/1.0',
          ...headers,
        },
        signal: AbortSignal.timeout(15000),
      });

      if (res.status >= 300 && res.status < 400 && res.headers.get('location')) {
        return await httpGet(res.headers.get('location'), headers, retries);
      }
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      return await res.text();
    } catch (e) {
      if (i === retries - 1) throw e;
      console.log(`    ⚠️ 重试 ${i + 1}/${retries}: ${e.message}`);
      await new Promise((r) => setTimeout(r, 2000 * (i + 1)));
    }
  }
}

// ---------- GitHub API ----------

async function getLatestCommit(repo) {
  const body = await httpGet(`https://api.github.com/repos/${repo}/commits?per_page=1`, {
    Accept: 'application/vnd.github.v3+json',
  });
  const arr = JSON.parse(body);
  return arr[0]?.sha || null;
}

async function fetchGitHubFile(repo, filePath) {
  const body = await httpGet(`https://api.github.com/repos/${repo}/contents/${filePath}`, {
    Accept: 'application/vnd.github.v3+json',
  });
  const json = JSON.parse(body);
  if (json.content) return Buffer.from(json.content, 'base64').toString('utf-8');
  if (json.download_url) return await httpGet(json.download_url);
  throw new Error('无法获取内容');
}

async function fetchUrl(url) {
  return await httpGet(url);
}

// ---------- 上游链接提取 ----------

async function extractLatestSubUrl(repo) {
  const readme = await fetchGitHubFile(repo, 'README.md');
  // 匹配 "免费Clash订阅链接" 后面代码块中的URL
  const match = readme.match(/免费Clash订阅链接[\s\S]*?```\s*\n?(https?:\/\/[^\s`]+)\s*\n?```/i);
  return match ? match[1].trim() : null;
}

// ---------- Base64 解码 ----------

function decodeBase64(str) {
  try {
    const d = Buffer.from(str.trim(), 'base64').toString('utf-8');
    return d.includes('vmess://') || d.includes('vless://') || d.includes('trojan://') ? d : str;
  } catch {
    return str;
  }
}

// ---------- Markdown 生成 ----------

function makeDateStr() {
  const now = new Date();
  return {
    date: now.toLocaleDateString('zh-CN', { timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit' }),
    time: now.toLocaleTimeString('zh-CN', { timeZone: 'Asia/Shanghai', hour: '2-digit', minute: '2-digit' }),
    isoDate: now.toLocaleString('sv-SE', { timeZone: 'Asia/Shanghai' }).replace(' ', 'T') + '+08:00',
  };
}

function genGitHubPost(src, results) {
  const { date, time, isoDate } = makeDateStr();
  let md = `---
title: "${src.title}"
description: "${src.desc}每小时自动更新。"
pubDate: ${isoDate}
category: "订阅"
tags: ["v2ray", "clash", "翻墙", "订阅", "免费"]
lang: "zh"
---

> 🕐 最近更新：${date} ${time}
>
> 本页内容自动同步自 [${src.repo}](https://github.com/${src.repo})

---

`;

  for (const r of results) {
    if (!r.success) {
      md += `## ❌ ${r.name}\n\n获取失败: ${r.error}\n\n---\n\n`;
      continue;
    }
    md += `## ${r.name}\n\n> ${r.desc}\n\n`;
    if (r.name === 'Clash') {
      md += `**订阅链接（复制到 Clash 客户端）：**\n\n`;
      md += `\`\`\`\nhttps://raw.githubusercontent.com/${src.repo}/main/${r.path}\n\`\`\`\n\n`;
      md += `> ⚠️ Clash 配置文件较大，请直接使用上方链接导入客户端。\n\n`;
    } else {
      md += `**订阅链接：**\n\n`;
      md += `\`\`\`\nhttps://raw.githubusercontent.com/${src.repo}/main/${r.path}\n\`\`\`\n\n`;
      md += `**节点列表：**\n\n\`\`\`\n${r.content.trim()}\n\`\`\`\n\n`;
    }
    md += `---\n\n`;
  }

  md += `## 📖 使用说明\n\n1. 复制上方订阅链接\n2. 在 V2Ray / Clash / 小火箭客户端中选择「导入订阅」\n3. 粘贴链接并更新即可\n\n`;
  md += `## 🔗 来源\n\n- [GitHub 仓库](https://github.com/${src.repo})\n`;
  return md;
}

function genUrlPost(src, nodeContent) {
  const { date, time, isoDate } = makeDateStr();
  return `---
title: "${src.title}"
description: "${src.desc}每小时自动更新。"
pubDate: ${isoDate}
category: "订阅"
tags: ["v2ray", "clash", "翻墙", "订阅", "免费"]
lang: "zh"
---

> 🕐 最近更新：${date} ${time}
>
> 本页内容自动同步自 [${src.repo}](https://github.com/${src.repo})

---

## 订阅链接

**V2Ray / Clash / 小火箭 通用订阅：**

\`\`\`
${src.url}
\`\`\`

---

## 节点列表

\`\`\`
${nodeContent.trim()}
\`\`\`

---

## 📖 使用说明

1. 复制上方订阅链接
2. 在 V2Ray / Clash / 小火箭客户端中选择「导入订阅」
3. 粘贴链接并更新即可

## 🔗 来源

- [GitHub 仓库](https://github.com/${src.repo})
`;
}

// ---------- Main ----------

async function main() {
  const sources = JSON.parse(fs.readFileSync(SOURCES_PATH, 'utf-8'));

  // 加载状态
  let state = {};
  if (fs.existsSync(STATE_PATH)) {
    try {
      state = JSON.parse(fs.readFileSync(STATE_PATH, 'utf-8'));
    } catch {
      // 状态文件损坏则重置
    }
  }

  let anyChanged = false;

  for (const src of sources) {
    console.log(`\n🔍 检查 ${src.name} (${src.repo})...`);

    // 检查最新提交
    let latestSha;
    try {
      latestSha = await getLatestCommit(src.repo);
    } catch (e) {
      console.log(`  ⚠️ 无法检查提交: ${e.message}，跳过`);
      continue;
    }

    if (state[src.name] === latestSha) {
      console.log(`  ⏭️ 无新提交，跳过`);
      continue;
    }

    console.log(`  🆕 发现新提交，开始抓取...`);
    anyChanged = true;

    let markdown;

    if (src.type === 'github-files') {
      const results = [];
      for (const f of src.files) {
        try {
          const content = await fetchGitHubFile(src.repo, f.path);
          results.push({ ...f, content, success: true });
          console.log(`    ✅ ${f.name}`);
        } catch (e) {
          results.push({ ...f, success: false, error: e.message });
          console.log(`    ❌ ${f.name}: ${e.message}`);
        }
        await new Promise((r) => setTimeout(r, 2000));
      }
      markdown = genGitHubPost(src, results);
    } else {
      try {
        // 从上游 README 提取最新订阅链接
        let latestUrl = src.url;
        try {
          const extracted = await extractLatestSubUrl(src.repo);
          if (extracted) {
            latestUrl = extracted;
            console.log(`    🔗 从上游提取到最新链接: ${latestUrl.substring(0, 50)}...`);
          } else {
            console.log(`    ⚠️ 未从上游提取到链接，使用 config 中的链接`);
          }
        } catch (e) {
          console.log(`    ⚠️ 提取上游链接失败: ${e.message}，使用 config 中的链接`);
        }

        const raw = await fetchUrl(latestUrl);
        const content = decodeBase64(raw);
        markdown = genUrlPost({ ...src, url: latestUrl }, content);
        console.log(`    ✅ 获取成功`);

        // URL 变了则更新配置
        if (latestUrl !== src.url) {
          src.url = latestUrl;
          fs.writeFileSync(SOURCES_PATH, JSON.stringify(sources, null, 2) + '\n', 'utf-8');
          console.log(`    📝 已更新 sub-sources.json 中的链接`);
        }
      } catch (e) {
        console.log(`    ❌ 获取失败: ${e.message}`);
        continue;
      }
    }

    // 写入博客文件
    const outPath = path.join(process.cwd(), 'src', 'content', 'blog', 'zh', src.name, 'index.md');
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, markdown, 'utf-8');
    console.log(`  📝 已写入 ${src.name}/index.md`);

    // 更新状态
    state[src.name] = latestSha;
  }

  // 保存状态
  fs.writeFileSync(STATE_PATH, JSON.stringify(state, null, 2) + '\n', 'utf-8');

  if (!anyChanged) {
    console.log('\n✅ 所有源均无更新，无需部署。');
    if (process.env.GITHUB_OUTPUT) {
      fs.appendFileSync(process.env.GITHUB_OUTPUT, 'changed=false\n');
    }
  } else {
    console.log('\n✅ 有更新，需要部署。');
    if (process.env.GITHUB_OUTPUT) {
      fs.appendFileSync(process.env.GITHUB_OUTPUT, 'changed=true\n');
    }
  }
}

main().catch(console.error);
