# FireflyIv 总站与子站功能清单
> 整理时间：2026-08-30 · 部署形态：腾讯云 4核4G Ubuntu 24.04 + Docker + Cloudflare Tunnel

## 一、主站 www.fireflyiv.com（Next.js 15 + React 19 + Tailwind v4）

### 内容
- 文章系统：Markdown 写在 content/posts/，SSG 静态生成，draft 草稿机制
- 文章页：封面系统（自定义图/自动渐变）、shiki 代码高亮（亮暗双主题）、TOC 目录（滚动高亮）、上一篇/下一篇导航、阅读进度条
- 浏览量实显：文章页展示真实 PV（直查 Umami Postgres，5 分钟缓存）
- 碎碎念 /chatter：SQLite 存储 + Bearer Token 发布 + 心情 emoji + 游标分页
- 标签 /tags + 归档 /archive（时间线）
- 友链 /links：卡片展示 + mailto 申请表单
- 关于 /about
- RSS /feed.xml（构建期静态生成）
- sitemap.xml + robots.txt

### 阅读与交互
- 站内全文搜索（导航 🔍 按钮 + 快捷键 / 打开，Esc 关闭，分词加权）
- Artalk 评论（talk.fireflyiv.com，未配置时优雅降级）
- 图片灯箱（正文图片点击放大，Esc 关闭）
- 返回顶部按钮（滚动 600px 出现）

### 视觉与动效（Firefly 主题）
- 暗色（默认）+ 亮色双主题，**跟随系统偏好 + 手动切换**（localStorage 记忆，首屏内联脚本防闪烁）
- 星空背景 + 漂移萤火虫光点
- 点击萤火扩散光环特效（P0）
- 鼠标拖尾光点（尊重 prefers-reduced-motion）
- 卡片流布局 + 萤光绿/琥珀黄点缀色

### SEO 与数据
- og:image（文章封面）、JSON-LD BlogPosting 结构化数据
- Umami 埋点统计（stats.fireflyiv.com）
- PWA manifest（可安装基础版；全量离线 SW 未做）

### 站点辅助
- 首页：英雄区 + 自建一言（api.fireflyiv.com，10 分钟缓存）+ 最新 6 篇
- 页脚：分站导航（统计/图床/短链/一言/RSS）
- 404 定制页

## 二、子站清单（14 个公网入口，全部经 Cloudflare Tunnel，服务器安全组仅开 22）

### 内容服务
| 子域 | 服务 | 端口 | 说明 |
|---|---|---|---|
| talk.fireflyiv.com | Artalk 评论 | 1234 | 博客评论区，管理后台同址 |
| i.fireflyiv.com | Lsky Pro 图床 | 8703 | SQLite 落卷；策略 URL 已修公网；上传限 100M |
| go.fireflyiv.com | Shlink 短链 | 8704 | 无效访问 302 回主站；SQLite |
| shlink.fireflyiv.com | 短链管理面板 | 8705 | 免登录（API key 内置） |
| api.fireflyiv.com | Hitokoto 一言 API | 8702 | 句子库 1 万条自建 Redis；CORS 全开；主站已切换使用 |
| paste.fireflyiv.com | PrivateBin 粘贴板 | 8711 | 数据落卷持久化 |
| note.fireflyiv.com | Memos 笔记 | 8712 | 首次打开初始化管理员（fireflyiv） |

### 数据与监控
| 子域 | 服务 | 端口 | 说明 |
|---|---|---|---|
| stats.fireflyiv.com | Umami 统计 | 8700 | Postgres 内网(172.17.0.1:8731)；主站已埋点 |
| uptime-kuma.fireflyiv.com | 可用性监控 | 3001 | 8 个监控项，60s 探测 |
| status.fireflyiv.com | 公开状态页 | 8708 | nginx 反代 kuma /status/firefly |
| monitor.fireflyiv.com | Beszel 服务器监控 | 8707→8706 | systemd 二进制 + agent 45876；nginx 反代修复 chunked 问题 |

### 导航与安全
| 子域 | 服务 | 端口 | 说明 |
|---|---|---|---|
| nav.fireflyiv.com | Dashy 导航站 | 8710 | 4 组导航；配置 ~/subsites/nav/conf.yml |
| vault.fireflyiv.com | Vaultwarden 密码库 | 8713 | 开放注册已关闭；主账号唯一 |

### 域名层
- www.fireflyiv.com（主）· fireflyiv.com → 301 www（apex 规则 + Always Use HTTPS）

## 三、服务器基础设施

- 规格：腾讯云轻量 4核4G / 40G SSD / 300G月流量(3M) / 到期 2027-07-21
- OS：Ubuntu 24.04.4，Docker 29.1.3 + Compose 2.40.3
- 隧道：Cloudflare 远程隧道（容器模式，面板管理 hostname，证书自动签发）
- nginx：80/8084（medical-demo 第三方）+ 8707/8708 反代
- systemd 服务：beszel、beszel-agent（自启）；zaowutu、community-healthcare（备用）
- 腾讯云组件：云镜 YDService、barad 监控 agent（系统自带）

### 端口分配总表
| 端口 | 用途 | 端口 | 用途 |
|---|---|---|---|
| 22 | SSH | 3001 | uptime-kuma |
| 80/8084 | nginx(第三方) | 8700/8731 | umami / umami-pg |
| 1234 | Artalk | 8702 | hitokoto(+redis 内网) |
| 18080 | java(第三方) | 8703 | lsky |
| 8082 | 主站 web | 8704/8705 | shlink / shlink-web |
| 45876 | beszel-agent | 8706/8707 | beszel / beszel反代 |
| 20241 | cloudflared | 8708 | status 反代 |
| | | 8710/8711/8712/8713 | nav / paste / note / vault |

## 四、运维体系

### 备份（每日 03:30 cron）
- 13 项全量备份至 /opt/backups/：11 个 Docker 卷 + Beszel 数据 + 博客 Markdown 源码 + nginx/systemd/隧道 token
- 保留 7 天轮转；异地同步（COS/对象存储）待配

### 监控
- 可用性：uptime-kuma 8 项（主站/裸域/评论/统计/一言/图床/短链/短链面板）
- 服务器：Beszel（CPU/内存/磁盘/网络/11 容器指标，agent 令牌可扩展多机）
- 访问统计：Umami（主站埋点，文章 PV 直查展示）
- ⚠️ 告警通知渠道未配（邮件/Webhook 待办）

### 安全
- 服务器仅开 22（安全组）；全部服务绑 127.0.0.1 或 docker 内网
- 隧道流量 TLS 由 Cloudflare 边缘签发
- 密码：应用层 6 系统统一密码，Vaultwarden 管理；SSH/Cloudflare 高敏凭据用户自持
- 密码表：服务器 ~/firefly-passwords.txt (600)

## 五、待办 / 后续方向

1. 告警通知（uptime-kuma + Beszel 邮件/Webhook）
2. 备份异地化（COS/rclone）
3. 友链表单后端化（现为 mailto）
4. 全量离线 Service Worker（PWA 完整化）
5. Memos 完成初始化 + 录入 Vaultwarden
6. 新子站候选：files.filebrowser / docker.Dockge / git.Gitea
7. 主站内容：持续写作
