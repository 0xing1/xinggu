import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';

const execAsync = promisify(exec);

/**
 * 获取科技新闻 API
 * 需要 ADMIN_API_KEY 环境变量进行认证
 * 请求头: Authorization: Bearer <ADMIN_API_KEY>
 */
export async function GET({ request, locals }) {
  try {
    // 认证检查
    const apiKey = locals.runtime?.env?.ADMIN_API_KEY || process.env.ADMIN_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({
        success: false,
        message: 'API 未配置：缺少 ADMIN_API_KEY 环境变量'
      }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const authHeader = request.headers.get('Authorization');
    if (!authHeader || authHeader !== `Bearer ${apiKey}`) {
      return new Response(JSON.stringify({
        success: false,
        message: '认证失败：无效的 API Key'
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const rootDir = process.cwd();
    const scriptPath = path.join(rootDir, 'scripts', 'fetch-news.js');

    // 检查脚本是否存在
    if (!fs.existsSync(scriptPath)) {
      return new Response(JSON.stringify({
        success: false,
        message: '新闻脚本不存在'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 运行新闻脚本
    const { stdout, stderr } = await execAsync(`node ${scriptPath}`, {
      cwd: rootDir,
      timeout: 30000
    });

    // 解析输出获取新闻列表
    const newsMatch = stdout.match(/\d+\. \[(.+?)\] (.+?)\n\s+🔗 (.+)/g);
    const news = newsMatch?.map(item => {
      const match = item.match(/\d+\. \[(.+?)\] (.+?)\n\s+🔗 (.+)/);
      return match ? {
        source: match[1],
        title: match[2],
        link: match[3]
      } : null;
    }).filter(Boolean) || [];

    return new Response(JSON.stringify({
      success: true,
      message: `成功获取 ${news.length} 条科技新闻`,
      news,
      output: stdout
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      message: `获取新闻失败: ${error.message}`
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
