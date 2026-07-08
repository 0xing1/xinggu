import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  site: 'https://xinggu-blog.pages.dev',
  output: 'static',
  adapter: cloudflare({
    routes: {
      exclude: ['/api/*'],
    },
  }),
  integrations: [
    mdx(),
    sitemap({
      lastmod: new Date(),
      changefreq: 'weekly',
      priority: 0.7,
      i18n: {
        defaultLocale: 'zh',
        locales: {
          zh: 'zh-CN',
          en: 'en-US',
        },
      },
    }),
  ],
  i18n: {
    defaultLocale: 'zh',
    locales: ['zh', 'en'],
    routing: {
      prefixDefaultLocale: false,
    },
  },
});