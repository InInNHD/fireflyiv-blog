# FireflyIv Blog — 项目设计文档

> 参照项目：[XinghuisamaBlogs](https://github.com/heiehiehi/XinghuisamaBlogs)（[在线站点](https://www.xinghuisama.top)，碎碎念页 /chatter）
> 目标部署：腾讯云服务器 + 域名 www.fireflyiv.com + tunnel 穿透
> 文档版本：v0.1（设计稿）
> 实现状态：2026-09-01 已升级至 Next.js 16，并完成第一阶段（内容模型、阅读体验、SEO、无障碍、友链防滥用）与第二阶段（追番、图集、最近状态、碎碎念增强）；下文保留为历史设计依据。

---

## 1. 参照项目拆解

### 1.1 可核实的公开事实

| 维度 | 事实 | 来源 |
|---|---|---|
| 技术栈 | **Next.js 15 + React 19** 静态博客 | 作者开源宣传视频《【开源】搭建一个高颜值的二次元个人静态博客！Next.js 15 + React 19》 |
| 风格 | 二次元/动漫风、高颜值、卡片流 | 同上 |
| 移动端 | 明确做了移动端尺寸适配（更新视频标题） | 《【开源更新】…移动端尺寸适配！》 |
| 特色页面 | /chatter（碎碎念/即时动态页） | 站点 URL |
| 形态 | 个人静态博客（内容以仓库方式管理） | GitHub 仓库 |

### 1.2 结合同类项目惯例的合理推断（设计参考，非事实）

这类 Next.js 二次元博客的常见构成：
- **首页**：大图英雄区 + 最新文章卡片流 + 个人卡片（头像/签名/B站/QQ）
- **文章页**：Markdown 渲染、TOC 目录、标签/分类、上一篇下一篇、评论区
- **列表页**：文章列表 / 标签聚合 / 归档时间线
- **/chatter**：短内容动态时间线（区别于长文章），支持随时发一条"此刻"
- **/links**：友链表；**/about**：关于页
- **辅助**：一言、看板娘(Live2D)、鼠标特效、BGM（可选项，很多同类站都带）
- **评论**：自托管方案（Artalk / Waline / Twikoo 之一）

---

## 2. 项目定位

**「复刻结构，换我皮囊」**：继承 XinghuisamaBlogs 的核心体验 ——
Next.js 技术栈、卡片流 UI、/chatter 碎碎念、移动端优先 ——
但主题改为 **Firefly（萤火）** 风格（呼应 fireflyiv 域名）：暗色星空 + 萤光点缀，
同时提供二次元/萌系样式开关，一键切换气质。

三条设计原则：
1. **内容即 Git**：全部文章/碎碎念的初始数据都是本地 Markdown/JSON + Git 版本化，永不丢失；
2. **静态优先，动态按需**：文章页全部静态生成；只有 chatter 写入和评论是动态的，
   且动态部分全部自托管在自己服务器（符合"部署到自己的服务器"的诉求）；
3. **轻运维**：服务器上只有 2~3 个进程（Next 服务、Artalk、可选 umami），Docker Compose 一把管。

---

## 3. 技术选型

| 维度 | 选择 | 理由 |
|---|---|---|
| 框架 | **Next.js 15 (App Router) + TypeScript** | 与参照项目同栈；RSC 性能好、社区资料全 |
| 内容流水线 | **content-collections**（content-collections.org） | Contentlayer 官方已归档，这是其主流继任者；类型安全、增量构建快 |
| Markdown | remark-gfm + rehype-slug + rehype-pretty-code | 代码高亮、标题锚点、GFM 表格任务列表 |
| 样式 | **Tailwind CSS v4** + CSS 变量主题令牌 | 设计令牌驱动，暗/亮 & Firefly/Moe 双主题通过 CSS 变量切换 |
| 图标 | @iconify/react | 图标即插即用 |
| 评论 | **Artalk**（ArtalkJS/Artalk） | Go 单二进制自托管、SQLite、自带后台与邮件通知，最契合自建服务器 |
| 碎碎念存储 | **better-sqlite3**（Node 内置 API route） | 单文件数据库零运维；写入走鉴权 token |
| 部署 | Docker Compose：web + artalk（可选 umami） | 服务器一条 docker compose up -d 完成 |
| 隧道 | cloudflared / frp（按用户既有方案） | 公网流量经隧道进入服务器本地端口 |
| 反代/TLS | **Caddy** | 自动 HTTPS，配置 5 行；tunnel 若已终结 TLS 则省略 |

**备选（若坚持纯静态）**：output: 'export' 静态导出 + 独立碎碎念服务（Hono + SQLite 小容器）。
主方案默认 Node 模式，理由：chatter 接口与站点同进程部署最简。

---

## 4. 目录结构（规划）

\`\`\`
FireflyIvBlog/
├── app/
│   ├── layout.tsx              # 根布局：主题令牌、导航、页脚
│   ├── page.tsx                # 首页：英雄区 + 最新文章 + 个人卡片
│   ├── posts/
│   │   ├── page.tsx            # 文章列表（分页）
│   │   └── [slug]/page.tsx     # 文章详情（MDX 渲染 + TOC + 评论区）
│   ├── tags/[tag]/page.tsx     # 标签聚合
│   ├── archive/page.tsx        # 归档时间线
│   ├── chatter/page.tsx        # ★ 碎碎念（核心特色页）
│   ├── links/page.tsx          # 友链
│   ├── about/page.tsx          # 关于
│   ├── feed.xml/route.ts       # RSS
│   ├── sitemap.ts
│   └── api/
│       ├── chatter/route.ts    # GET 列表（公开）
│       └── chatter/post/route.ts # POST 发布（Bearer token 鉴权）
├── components/
│   ├── layout/    (Nav, Footer, ThemeToggle, BackgroundGlow)
│   ├── post/      (PostCard, TOC, TagBadge, PrevNext)
│   ├── chatter/   (ChatterTimeline, ChatterComposer)
│   └── misc/      (Live2D, Hitokoto, BackToTop)
├── content/                   # 内容仓库（Git 版本化）
│   ├── posts/*.mdx            # 文章（frontmatter: title/date/tags/cover/description）
│   ├── links.json             # 友链数据
│   └── site.json              # 站点元信息（昵称/签名/社交链接）
├── lib/                       # content-collections 定义、db（sqlite）、工具函数
├── public/                    # 头像、背景插画、图标
├── docker/
│   ├── Dockerfile
│   └── docker-compose.yml     # web + artalk (+umami)
├── deploy/                    # 部署脚本、Caddyfile、cloudflared 配置示例
└── package.json
\`\`\`

---

## 5. 路由与页面清单

| 路由 | 内容 | 渲染方式 |
|---|---|---|
| / | 英雄区（站点名/签名/萤火动画）+ 最新 6 篇 + 个人卡片 | SSG/ISR |
| /posts | 全部文章卡片流（分页） | SSG |
| /posts/[slug] | 正文 + TOC + 标签 + 上一篇/下一篇 + Artalk 评论 | SSG |
| /tags/[tag] | 按标签过滤 | SSG |
| /archive | 按年/月归档时间线 | SSG |
| /chatter | ★ 碎碎念时间流 + 发送框（管理员 token 发布） | SSR + 客户端拉取 |
| /links | 友链卡片 | SSG |
| /about | 关于/建站历程 | SSG |
| /feed.xml、/sitemap.xml | RSS / 站点地图 | 动态路由 |
| __/admin（Artalk） | 评论管理后台 | 由 Artalk 容器提供 |

---

## 6. 数据模型

### 6.1 文章 frontmatter（content/posts/*.mdx）

\`\`\`yaml
---
title: 文章标题
date: 2026-03-01
updated: 2026-03-05        # 可选
tags: ["Next.js:nextjs", "部署:deploy"]  # "显示名:ASCII-slug"，URL 用 slug
cover: /images/cover01.webp # 可选，缺省用渐变占位
description: 摘要，用于列表与 SEO
draft: false                # true 时本地可见不上线
---
\`\`\`

### 6.2 碎碎念表（SQLite，data/firefly.db）

\`\`\`sql
CREATE TABLE chatter (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  content   TEXT NOT NULL,             -- 内容（纯文本/轻 Markdown）
  mood      TEXT,                      -- 可选：emoji 心情
  img       TEXT,                      -- 可选：附图 URL
  created_at INTEGER NOT NULL,
  updated_at INTEGER
);
\`\`\`

### 6.3 友链（content/links.json）

\`\`\`json
{ "name": "站点名", "url": "https://…", "avatar": "…", "desc": "一句话简介" }
\`\`\`

---

## 7. /chatter 页面设计（本项目亮点）

参照 Xinghuisama 的 /chatter 交互，设计如下：

- **时间线**：按时间倒序的卡片流，卡片含内容、心情 emoji、可选附图、相对时间（"5 分钟前"）；
- **加载更多**：游标分页（?before=<id>），每次 20 条；
- **发送框**：固定在时间流顶部/浮动按钮；只有持有 token 的管理员可见可发
  —— 意味着**在手机上也能随时发一条碎碎念**（移动端优先的意义所在）；
- **鉴权**：Authorization: Bearer $CHATTER_TOKEN（环境变量注入），POST 前服务端校验；
- **现代感**：新消息淡入动画、仿"朋友圈"式点赞计数（可选 v2）。

---

## 8. 部署架构（腾讯云 + tunnel）

\`\`\`text
访客 ──> www.fireflyiv.com
            │ DNS（按 tunnel 方案 A 记录 / CNAME）
            ▼
       ┌──────────────┐
       │  tunnel 入口  │  cloudflared / frp（你在服务器/本地已有）
       └──────┬───────┘
              │ 隧道（公网→服务器本地端口）
              ▼
腾讯云服务器（无需向公网开放 80/443）
   ┌──────────────────────────────────────┐
   │  Caddy :80/:443（可选，tunnel 已终结 TLS 则只监听 127.0.0.1） │
   │    ├─ 127.0.0.1:8082 → Next.js(web)（容器内 3000）  │
   │    └─ 127.0.0.1:1234 → Artalk 评论    │
   │  Docker Compose：web + artalk + data  │
   └──────────────────────────────────────┘
\`\`\`

关键点：
1. **不外开端口**：所有服务只绑 127.0.0.1，公网入口完全交给 tunnel，安全面最小；
2. **TLS**：隧道端（如 Cloudflare Tunnel）负责证书则 Caddy 可省；否则 Caddy 自动签发；
3. **数据持久化**：SQLite 文件挂 Docker volume，定期 sqlite3 .backup + 同步到 Git/对象存储；
4. **内容发布**：本地写 Markdown → git push → 服务器 crontab 每小时运行 `ops/deploy-web.sh`（拉取→仅重建 web→健康检查→失败回滚）；
   手动全量部署可 `cd deploy && bash deploy.sh`；
5. **备案提示**：国内服务器 + 域名需 ICP 备案；tunnel 方案可规避直接暴露 80/443，合规性自行评估。

---

## 9. 实施路线（Milestone）

| 里程碑 | 内容 | 验收标准 |
|---|---|---|
| **M0 脚手架** | Next.js 15 + TS + Tailwind v4 + content-collections 打通 | pnpm dev 能渲染一篇示例 MDX |
| **M1 主题壳** | 布局/导航/主题切换/Firefly 视觉（星空+萤光 CSS 变量） | 首页英雄区 + 暗色切换 |
| **M2 文章流水线** | 列表/详情/TOC/标签/归档/RSS/sitemap | 5 篇示例文章全路由可用 |
| **M3 chatter** ✅ | SQLite（node:sqlite）+ API + 时间线 + 发送框 + token 鉴权 + 限流 | 已实现并验收：401/201/400/500 截断/分页全通过 |
| **M4 评论** ✅ | Artalk 容器(compose) + 前端组件嵌入 | 前端已接入（动态 import）；容器服务待部署时启用 |
| **M5 部署** | Docker Compose + tunnel 配置 + 域名上线 | www.fireflyiv.com 全站可访问 |
| **M6 打磨**（大部分 ✅） | 点击萤火特效 ✅ · 文章配图系统（cover/自动渐变封面/og:image）✅ · 代码高亮（shiki 双主题）✅ · RSS（/feed.xml）✅ · 文章 TOC + 上一篇/下一篇 ✅ · 站内搜索（/ 快捷键）✅ · 阅读进度条 ✅ · 鼠标拖尾 ✅ · 一言 ✅ · 图片灯箱 ✅ · PWA manifest ✅ · 友链申请表单（mailto）✅ | 暂缓：看板娘 Live2D（需外部模型素材）、BGM（需音频素材）、全量离线 Service Worker |

---

## 10. 风险与取舍

| 取舍 | 说明 |
|---|---|
| Node 模式 vs 纯静态 | 选 Node 模式换 chatter 同进程部署；若日后想上 CDN 静态缓存，可再拆独立碎碎念服务 |
| 二次元元素 | 默认收敛（Firefly 主题），萌系开关保留——风格随你，核心是结构与体验 |
| 评论依赖 Artalk 升级 | 已内置多月更新惯例；数据在 SQLite，随时可迁移 Waline/Twikoo |
| 服务器资源 | 1核2G 足够：Next + Artalk 峰值内存约 500~800MB |
| 安全 | 全服务 127.0.0.1 + token 鉴权 + 定期备份；chatter 发布接口限流（IP + token） |

---

## 11. 致谢与参考

- 参照项目：[heiehiehi/XinghuisamaBlogs](https://github.com/heiehiehi/XinghuisamaBlogs) 与 [www.xinghuisama.top/chatter](https://www.xinghuisama.top/chatter)（开源宣传视频：[B站 BV1RMorB7E1K](https://www.bilibili.com/video/BV1RMorB7E1K/)）
- 评论系统：[ArtalkJS/Artalk](https://github.com/ArtalkJS/Artalk)
- 同类参考：kemiao-suzublog、[ttimochan/wikimoeNodeJSBlog](https://github.com/ttimochan/wikimoeNodeJSBlog)（Nuxt 全栈，作为功能对照）
