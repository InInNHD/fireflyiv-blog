---
title: 本站技术栈与设计
date: 2026-02-28
category: "技术:tech"
series: "建站手记:site-building"
pinned: false
comment: true
tags: ["Next.js:nextjs", "前端:frontend"]
cover: /covers/blog-stack.svg
description: 复刻 XinghuisamaBlogs 式体验：Next.js 15 + React 19 + Tailwind v4，卡片流、双主题、星空萤火背景。
---

## 选型一览

| 层 | 技术 |
|---|---|
| 框架 | Next.js 15（App Router） |
| 语言 | TypeScript（strict） |
| 样式 | Tailwind CSS v4 + CSS 变量双主题 |
| 内容 | Markdown + frontmatter（gray-matter 解析） |
| Markdown 渲染 | unified + remark-parse + remark-gfm + rehype-slug + rehype-shiki（shiki 双主题高亮） |
| 部署 | Docker + Caddy + Cloudflare Tunnel |

## 主题设计

**Firefly 主题**围绕两个 CSS 变量组展开：

- `--bg / --surface / --fg / --muted / --line`：层次结构；
- `--accent`（萤光绿 `#7cf0b0`）/ `--accent2`（琥珀黄 `#ffd873`）：点缀色。

深色是默认态：夜空蓝紫底 + 星点 + 漂移的萤火虫光点，
光点用 6 个 `position: fixed` 的 span + CSS keyframes 实现，零 JS。
亮色主题是一套完整的 `html.light` 变量覆盖，点击导航栏月亮/太阳按钮切换，
选择保存在 localStorage，首屏内联脚本防闪烁。

## 内容流水线

文章放在 `content/posts/`，frontmatter 字段：

```yaml
---
title: 文章标题
date: 2026-02-28
tags: [Next.js, 前端]
description: 摘要
draft: false
---
```

构建时全部静态生成（SSG）；`draft: true` 的文章只在开发环境可见。
列表、标签、归档、站点地图、RSS 全部由同一份 `getAllPosts()` 派生，不会出现数据不一致。
