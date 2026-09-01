# FireflyIv Blog

萤火虽微，愿为其芒 —— 自托管的个人博客（Next.js 15 + React 19 + Tailwind CSS v4 + SQLite）。

- 文章：Markdown 写在 `content/posts/`，构建时静态生成
- 碎碎念：`/chatter`，SQLite（Node 内置 `node:sqlite`）存储，Bearer Token 鉴权发布
- 评论：Artalk 自托管（可选，未配置时自动隐藏）
- 锦上添花：代码高亮（shiki）、RSS、文章目录 + 上一篇/下一篇、站内搜索（`/` 快捷键）、阅读进度条、鼠标萤火拖尾、一言、图片灯箱、友链申请表单、PWA manifest
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
| `CHATTER_TOKEN` | 碎碎念发布 token（页面「🔑 管理员」输入） | 想发碎碎念时必填 |
| `NEXT_PUBLIC_ARTALK_SERVER` | Artalk 评论服务地址 | 未部署 Artalk 可留空 |

## 写一篇文章

在 `content/posts/` 新建 `xxx.md`：

```markdown
---
title: 文章标题
date: 2026-03-01
tags: ["随笔:misc", "建站:setup"]   # "显示名:ASCII-slug" 或直接写字符串
description: 摘要，用于列表页与 SEO
draft: false                        # true 只在本地可见
---

正文 Markdown 内容…
```

保存后开发模式下立即生效；标签页/归档页/RSS 均自动同步。

## 发布碎碎念

1. 设置环境变量 `CHATTER_TOKEN`（任意长随机字符串，如 `openssl rand -hex 24`）；
2. 重启 dev server；
3. 打开 `/chatter` -> 点「🔑 管理员」输入同一个 token -> 即可发布（token 保存在浏览器 localStorage）。

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
components/     # 导航/卡片/搜索/进度条/拖尾/灯箱/一言/友链表单/碎碎念/评论 组件
content/        # 内容即 Git：文章、友链、站点元信息
lib/            # 文章读取、SQLite 数据层、shiki 高亮插件
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
