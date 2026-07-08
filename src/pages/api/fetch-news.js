export const prerender = true;

/**
 * 获取科技新闻 API (仅本地/CI 使用)
 * 线上不可用 - 此端点返回 404
 */
export function GET() {
  return new Response('Not Found', { status: 404 });
}
