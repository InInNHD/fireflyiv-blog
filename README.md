# FireflyIv Blog

萤火虽微，愿为其芒 —— 自托管的个人博客（Next.js 16 + React 19 + Tailwind CSS v4 + SQLite）。

- 文章：Markdown 写在 `content/posts/`，支持分类、系列、置顶、阅读时长、相关文章、过期提示与独立评论开关
- 碎碎念：`/chatter` 公开只读，`/admin/chatter` 发布；SQLite（Node 内置 `node:sqlite`）存储，支持图片、标签、独立链接与 Bearer Token 鉴权
- 项目与服务：`/projects`，集中展示主站与公开自托管服务
- 二次元内容：`/anime` 追番状态、`/music` 原生音频与同步歌词、`/gallery` 图集灯箱、首页「最近状态」
- 评论：Artalk 自托管（可选，未配置时自动隐藏）
- 阅读体验：Shiki 代码高亮与复制、GitHub 风格提示块、RSS、目录、上一篇/下一篇、站内搜索（`/` 快捷键）、阅读进度条、图片灯箱
- SEO 与安全：动态 OG 图、canonical、Twitter Card、sitemap、友链表单 Turnstile（可选）
- 部署：Docker + Cloudflare Tunnel（详见 [deploy/README.md](deploy/README.md)）

## 环境要求

| 工具 | 版本 |
|---|---|
| Node.js | **>= 22.5**（推荐 24 LTS，碎碎念依赖内置 `node:sqlite`） |
| npm | 任意较新版本（11+ 推荐） |

## 本地启动

```bash
# 1. 安装依赖
npm install

# 2. 配置环境变量（可选但建议）
#    复制 .env.example 为 .env.local 并按需修改
cp .env.example .env.local
```

### 开发模式（写文章、改代码用这个）

```bash
npm run dev
```

打开 http://localhost:3000 即可。改 `content/posts/*.md` 或代码都会热更新。

### 生产模式（模拟线上效果）

> 本项目为 `output: "standalone"`；`npm start` = `node .next/standalone/server.js`（不使用 `next start`）：

```bash
npm run build
npm start   # = node .next/standalone/server.js（本地 127.0.0.1:3000）
```

## 环境变量（.env.local）

| 变量 | 作用 | 必填 |
|---|---|---|
| `SITE_URL` | RSS/sitemap/OG 的绝对地址 | 上线前必填 |
| `CHATTER_TOKEN` | 碎碎念发布 token（在 `/admin/chatter` 输入） | 想发碎碎念时必填 |
| `NEXT_PUBLIC_ARTALK_SERVER` | Artalk 评论服务地址 | 未部署 Artalk 可留空 |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Cloudflare Turnstile 站点密钥 | 开启友链反滥用时必填 |
| `TURNSTILE_SECRET_KEY` | Cloudflare Turnstile 服务端密钥 | 开启友链反滥用时必填 |

## 写一篇文章

在 `content/posts/` 新建 `xxx.md`：

```markdown
---
title: 文章标题
date: 2026-03-01
updated: 2026-09-01                 # 可选，最后更新时间
tags: ["随笔:misc", "建站:setup"]   # "显示名:ASCII-slug" 或直接写字符串
category: "建站:setup"              # 可选，单一分类
series: "建站手记:site-building"    # 可选，系列聚合
description: 摘要，用于列表页与 SEO
draft: false                        # true 只在本地可见
pinned: false                       # 是否置顶
comment: true                       # 是否显示 Artalk 评论
---

正文 Markdown 内容…
```

保存后开发模式下立即生效；标签、分类、系列、归档、RSS 与 sitemap 均自动同步。提交前运行 `npm run typecheck` 与 `npm run check:content`，生产构建后再运行 `npm run check:performance`。

## 发布碎碎念

1. 设置环境变量 `CHATTER_TOKEN`（任意长随机字符串，如 `openssl rand -hex 24`）；
2. 重启 dev server；
3. 打开 `/admin/chatter`，输入同一个 token，即可通过 `/api/admin/chatter` 发布文字、心情、图片与标签（token 仅保存在浏览器 sessionStorage）；公开的 `/chatter` 和 `GET /api/chatter` 只提供读取。Cloudflare Access 应同时保护 `/admin/chatter*` 与 `/api/admin/chatter*`。

## 更新追番、音乐、图集与最近状态

- `content/anime.json`：维护追番条目、状态、进度、评分、封面与短评；未录入时页面显示诚实的空状态。
- `content/music.json`：维护歌曲标题、歌手、音频、封面和 LRC 歌词；只放有权公开托管的音频，播放器会在用户点击后加载。
- `content/gallery.json`：维护图片地址、替代文本、说明与日期；原图可先用 `npm run prepare:gallery` 剥离 EXIF/GPS 并生成 WebP、AVIF 和缩略图。
- `content/site.json` 的 `now`：维护首页当前游戏、音乐和一句近况。

## Docker 本地部署

> 容器内使用 Node 24（内置 sqlite）；主机侧端口已避开 Windows Hyper-V 排除段，web 映射到 **8082**（与服务器现网一致）。

```bash
cd deploy

# 可选：设置碎碎念发布 token（不设则用 compose 默认值）
# export CHATTER_TOKEN=你的随机字符串

# 构建并启动（首次会拉取 node:24-alpine 与 artalk-go 镜像，约几分钟）
docker compose up -d --build
```

| 服务 | 访问地址 | 说明 |
|---|---|---|
| 博客 | http://127.0.0.1:8082 | Next.js 主站 |
| Artalk 评论 | http://127.0.0.1:1234 | 评论后端（首次启动自动生成配置） |

数据持久化在 Docker volume：`deploy_fireflyiv-data`（碎碎念 SQLite）与 `deploy_fireflyiv-artalk`（评论）。

常用命令：

```bash
docker compose logs -f web      # 看主站日志
docker compose restart web      # 重启主站
docker compose up -d --build    # 改代码后重新构建部署
docker compose down             # 停止（保留数据）
docker compose down -v          # 停止并清除数据卷（慎用）
```

## 目录速览

```
app/            # Next.js App Router 页面与 API（含 feed.xml / search-index.json / manifest）
components/     # 导航/卡片/搜索/进度条/灯箱/友链/碎碎念/评论等组件
content/        # 内容即 Git：文章、追番、音乐、图集、友链、站点元信息
lib/            # 内容读取、SQLite 数据层、Markdown 与 OG 图生成
deploy/         # Docker Compose / cloudflared / Caddy 部署文件
docs/           # 项目设计文档
```
## Git 工作流（本机为源）

```text
本机 E:\personal blog（真源）
  │  git commit + push（SSH key）
  ▼
GitHub: InInNHD/fireflyiv-blog（Public，已做敏感信息脱敏）
  │  服务器每小时 cron 自动 git pull --ff-only 对齐
  ▼
服务器 ~/fireflyiv-blog（部署副本；~/subsites → deploy/subsites 软链接）
```

- **日常更新**：本机改文件 → `git add -A && git commit && git push` → 部署到服务器（上传或等 pull）→ 按需 rebuild
- **敏感信息红线**：`.env`、密码、授权码**绝不入库**（已 .gitignore；样例见各 `.env.example`）
- **服务器对齐**：每小时自动 pull；手动触发：`cd ~/fireflyiv-blog && git pull origin main`
- **一致性检查**：本机 `git status`、服务器 `git log --oneline -1`、GitHub 网页，三者应指向同一 commit
- **公网验收**：运行 `npm run check:smoke`，一次检查 14 个入口及内容、JSON、静态资源 MIME 与 Access 边界
