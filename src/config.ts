/**
 * Centralized site configuration.
 * Edit this file to customize your blog settings.
 */

export const SITE = {
  website: "https://xinggu-blog.pages.dev",
  author: "星谷",
  profile: "https://xinggu-blog.pages.dev/about",
  desc: "分享前端开发、编程技巧和技术见解",
  title: "星谷的技术博客",
  ogImage: "/og-image.svg",
  lightAndDarkMode: true,
  postPerPage: 6,
  postPerIndex: 4,
  scheduledPostMargin: 15 * 60 * 1000, // 15 minutes
};

export const LOGO_IMAGE = {
  enable: false,
  svg: false,
  width: 216,
  height: 46,
};

export const SOCIALS = [
  { name: "github", href: "https://github.com", active: true },
  { name: "twitter", href: "https://twitter.com", active: true },
  { name: "mail", href: "mailto:xinggu@example.com", active: true },
];

export const SHARE_LINKS = [
  { name: "twitter", href: "https://twitter.com/intent/tweet?text=" },
  { name: "facebook", href: "https://www.facebook.com/sharer/sharer.php?u=" },
  { name: "linkedin", href: "https://www.linkedin.com/shareArticle?mini=true&url=" },
];
