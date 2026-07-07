import fs from 'fs';
import path from 'path';
import https from 'https';

const STATE_PATH = path.join(process.cwd(), 'scripts', '.sub-state.json');
const SOURCES_PATH = path.join(process.cwd(), 'scripts', 'sub-sources.json');

// ---------- HTTP helpers ----------

function httpsGet(url, headers = {}) {
  return new Promise((resolve, reject) => {
    https
      .get(url, { headers: { 'User-Agent': 'sub-crawler/1.0', ...headers } }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          return httpsGet(res.headers.location, headers).then(resolve, reject);
        }
        if (res.statusCode !== 200) return reject(new Error(`HTTP ${res.statusCode}`));
        const chunks = [];
        res.on('data', (c) => chunks.push(c));
        res.on('end', () => resolve(Buffer.concat(chunks).toString()));
        res.on('error', reject);
      })
      .on('error', reject);
  });
}

async function retry(fn, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try { return await fn(); } catch (e) {
      if (i === retries - 1) throw e;
      await new Promise((r) => setTimeout(r, 2000 * (i + 1)));
    }
  }
}

// ---------- Repo commit check ----------

async function getLatestCommit(repo) {
  const body = await retry(() =>
    httpsGet(`https://api.github.com/repos/${repo}/commits?per_page=1`, {
      Accept: 'application/vnd.github.v3+json',
    })
  );
  const arr = JSON.parse(body);
  return arr[0]?.sha || null;
}

// ---------- Content fetchers ----------

async function fetchGitHubFile(repo, filePath) {
  const body = await retry(() =>
    httpsGet(`https://api.github.com/repos/${repo}/contents/${filePath}`, {
      Accept: 'application/vnd.github.v3+json',
    })
  );
  const json = JSON.parse(body);
  if (json.content) return Buffer.from(json.content, 'base64').toString('utf-8');
  if (json.download_url) return await retry(() => httpsGet(json.download_url));
  throw new Error('无法获取内容');
}

async function fetchUrl(url) {
  return await retry(() => httpsGet(url));
}

function decodeBase64(str) {
  try {
    const d = Buffer.from(str.trim(), 'base64').toString('utf-8');
    return (d.includes('vmess://') || d.includes('vless://') || d.includes('trojan://')) ? d : str;
  } catch { return str; }
}

// ---------- Markdown generators ----------

function makeDateStr() {
  const now = new Date();
  return {
    date: now.toLocaleDateString('zh-CN', { timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit' }),
    time: now.toLocaleTimeString('zh-CN', { timeZone: 'Asia/Shanghai', hour: '2-digit', minute: '2-digit' }),
    isoDate: now.toISOString().split('T')[0],
  };
}

function genGitHubPost(src, results) {
  const { date, time, isoDate } = makeDateStr();
  let md = `---
title: "${src.title}"
description: "${src.desc}每8小时自动更新。"
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
    if (!r.success) { md += `## ❌ ${r.name}\n\n获取失败: ${r.error}\n\n---\n\n`; continue; }
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
description: "${src.desc}每8小时自动更新。"
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

  // Load state
  let state = {};
  if (fs.existsSync(STATE_PATH)) {
    try { state = JSON.parse(fs.readFileSync(STATE_PATH, 'utf-8')); } catch {}
  }

  let anyChanged = false;

  for (const src of sources) {
    console.log(`\n🔍 检查 ${src.name} (${src.repo})...`);

    // Check latest commit
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
        const raw = await fetchUrl(src.url);
        const content = decodeBase64(raw);
        markdown = genUrlPost(src, content);
        console.log(`    ✅ 获取成功`);
      } catch (e) {
        console.log(`    ❌ 获取失败: ${e.message}`);
        continue;
      }
    }

    // Write blog post
    const outPath = path.join(process.cwd(), 'src', 'content', 'blog', 'zh', src.name, 'index.md');
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, markdown, 'utf-8');
    console.log(`  📝 已写入 ${src.name}/index.md`);

    // Update state
    state[src.name] = latestSha;
  }

  // Save state
  fs.writeFileSync(STATE_PATH, JSON.stringify(state, null, 2) + '\n', 'utf-8');

  if (!anyChanged) {
    console.log('\n✅ 所有源均无更新，无需部署。');
    // Set output for GitHub Actions
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
