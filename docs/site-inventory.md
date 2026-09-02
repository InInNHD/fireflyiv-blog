# FireflyIv 总站与子站功能清单
> 整理时间：2026-09-01 · 部署形态：腾讯云 4核4G Ubuntu 24.04 + Docker + Cloudflare Tunnel

## 一、主站 www.fireflyiv.com（Next.js 16 + React 19 + Tailwind v4）

### 内容
- 文章系统：Markdown 写在 content/posts/，SSG 静态生成，支持草稿、置顶、分类、系列、独立评论开关
- 文章页：封面系统（自定义图/自动渐变）、shiki 双主题高亮与代码复制、GitHub 风格提示块、TOC、阅读时长、相关文章、过期提示、上一篇/下一篇、阅读进度条
- 浏览量实显：文章页展示真实 PV（直查 Umami Postgres，5 分钟缓存）
- 碎碎念 /chatter：SQLite 存储 + Bearer Token 发布 + 心情 emoji + 图片 + 标签 + 独立链接 + 游标分页
- 标签 /tags + 分类 /categories + 系列 /series + 归档 /archive（时间线）
- 追番 /anime：观看状态、进度、评分、短评与外链；无条目时显示空状态
- 音乐 /music：点击后才加载音频、歌单切换、LRC 同步滚动、错误与无歌词状态
- 图集 /gallery：内容文件驱动的图集与灯箱；导入脚本剥离 EXIF/GPS，并生成 WebP、AVIF、缩略图与 manifest
- 友链 /links：卡片展示 + API 入库申请表单 + 可选 Cloudflare Turnstile 校验
- 关于 /about
- RSS /feed.xml（构建期静态生成）
- sitemap.xml + robots.txt

### 阅读与交互
- 站内全文搜索（导航 🔍 按钮 + 快捷键 / 打开，Esc 关闭，分词加权、焦点约束与恢复）
- 手机与平板使用标准导航抽屉，支持 `aria-current`、Esc、焦点循环与关闭后焦点恢复
- Artalk 评论（talk.fireflyiv.com，未配置时优雅降级）
- 图片灯箱（正文与图集图片点击放大，Esc 关闭）
- 返回顶部按钮（滚动 600px 出现）

### 视觉与动效（Firefly 主题）
- 暗色（默认）+ 亮色双主题，**跟随系统偏好 + 手动切换**（localStorage 记忆，首屏内联脚本防闪烁）
- 星空背景 + 漂移萤火虫光点
- 点击萤火扩散光环与鼠标拖尾光点（均尊重 `prefers-reduced-motion`）
- 卡片流布局 + 萤光绿/琥珀黄点缀色

### SEO 与数据
- 动态 og:image、canonical、Twitter Card、JSON-LD BlogPosting 结构化数据
- Umami 埋点统计（stats.fireflyiv.com）
- PWA manifest（可安装基础版；全量离线 SW 未做）

### 站点辅助
- 首页：紧凑玻璃 Bento + 自建一言（api.fireflyiv.com，10 分钟缓存）+ 服务状态 + 最新文章；没有真实数据的模块不展示
- 页脚：分站导航（统计/图床/短链/一言/RSS）
- 404 定制页

## 二、子站清单（14 个公网入口，全部经 Cloudflare Tunnel，服务器安全组仅开 22）

### 内容服务
| 子域 | 服务 | 端口 | 说明 |
|---|---|---|---|
| talk.fireflyiv.com | Artalk 评论 | 1234 | 博客评论区，管理后台同址 |
| i.fireflyiv.com | Lsky Pro 图床 | 8703 | SQLite 落卷；策略 URL 已修公网；上传限 100M |
| go.fireflyiv.com | Shlink 短链 | 8704 | 无效访问 302 回主站；SQLite |
| shlink.fireflyiv.com | 短链管理面板 | 8705 | 首屏不预置服务器或 API key；`servers.json` 禁止匿名读取 |
| api.fireflyiv.com | Hitokoto 一言 API | 8702 | 句子库 1 万条自建 Redis；CORS 全开；主站已切换使用 |
| paste.fireflyiv.com | PrivateBin 粘贴板 | 8711 | 数据落卷持久化 |
| note.fireflyiv.com | Memos 笔记 | 8712 | 首次打开初始化管理员（fireflyiv） |

### 数据与监控
| 子域 | 服务 | 端口 | 说明 |
|---|---|---|---|
| stats.fireflyiv.com | Umami 统计 | 8700 | Postgres 内网(172.17.0.1:8731)；主站已埋点 |
| uptime-kuma.fireflyiv.com | 可用性监控 | 3001 | 14 个内容探针，60s 探测；裸域跳转另行验收 |
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
- 12 个 Docker 卷 + Beszel 数据 + 博客源码 + nginx/systemd/隧道 token；Postgres 与 SQLite 使用一致性导出
- 本地保留 7 天，并通过 rclone crypt 加密同步到 Cloudflare R2；Redis 先 SAVE，排除临时 RDB

### 监控
- 可用性：Uptime Kuma 14 项功能探针；页面检查稳定特征，一言 API 校验 JSON 对象，导航检查实际配置文件
- 服务器：Beszel（CPU/内存/磁盘/网络/11 容器指标，agent 令牌可扩展多机）
- 访问统计：Umami（主站埋点，文章 PV 直查展示）
- 告警：Uptime Kuma 14 个内容探针与 Beszel 资源阈值均发送到 QQ 邮箱；磁盘使用率达到 80% 时告警
- 磁盘维护：Docker 构建缓存每周限制在 3GB；2026-09-02 首次清理释放 6.26GB，系统盘使用率由 72% 降至 56%
- 独立冒烟命令：`npm run check:smoke` 验证 14 个公网入口、内容、JSON、MIME 与 Access 例外

### 安全
- 服务器仅开 22（安全组）；全部服务绑 127.0.0.1 或 docker 内网
- 隧道流量 TLS 由 Cloudflare 边缘签发
- apex HSTS 覆盖子域；Shlink、Beszel 与管理路径由 Cloudflare Access 保护，Umami 仅公开脚本和采集 API
- 友链申请启用 Cloudflare Turnstile
- 密码：应用层 6 系统统一密码，Vaultwarden 管理；SSH/Cloudflare 高敏凭据用户自持
- 密码表：服务器 ~/firefly-passwords.txt (600)

## 五、待办 / 后续方向

1. 补充真实追番条目、个人图集与首页游戏/音乐状态
2. Memos 完成初始化 + 录入 Vaultwarden
3. 主站内容：持续写作，并逐步整理系列文章
4. 全量离线 Service Worker（内容稳定后再评估）
