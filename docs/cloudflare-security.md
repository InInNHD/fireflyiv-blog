# Cloudflare 安全配置清单

以下项目属于 Cloudflare 账户状态，不能只靠仓库部署完成。修改后应同时验收浏览器、原生客户端和 Uptime Kuma 探针。

## HSTS

在 `fireflyiv.com` 区域的 **SSL/TLS → Edge Certificates → HTTP Strict Transport Security** 设置：

- Max Age：12 个月；
- Apply HSTS policy to subdomains：开启；
- No-Sniff Header：开启；
- Preload：先保持关闭，连续运行稳定且确认全部子域永久支持 HTTPS 后再评估。

HSTS 必须由 apex 的 HTTPS 响应下发；只在 `www` 源站添加 `includeSubDomains` 不会覆盖同级子域。

## Access 应用边界

先配置只允许站长身份的复用 Allow 策略，再创建 Self-hosted applications：

| 应用 | 匹配范围 | 说明 |
|---|---|---|
| Shlink 管理 | `shlink.fireflyiv.com/*` | 整站保护 |
| Beszel | `monitor.fireflyiv.com/*` | 整站保护 |
| Artalk 后台 | `talk.fireflyiv.com/sidebar*` | 评论前台与公开 API 不受影响 |
| Uptime Kuma 后台 | `uptime-kuma.fireflyiv.com/dashboard*` | 公开状态页使用独立 `status` 子域 |
| 碎碎念管理 | `www.fireflyiv.com/admin/chatter*` | 公开 `/chatter` 与读取 API 不受影响 |
| Umami 后台 | `stats.fireflyiv.com/*` | 默认保护；为下面两个更具体路径创建 Bypass |
| Umami 脚本 | `stats.fireflyiv.com/script.js` | Bypass，供主站加载 |
| Umami 采集 | `stats.fireflyiv.com/api/send` | Bypass，供公开埋点写入 |

整站保护后，公网监控也会遇到 Access 登录页。为 Shlink 与 Beszel 创建 service token，并把 `CF-Access-Client-Id` / `CF-Access-Client-Secret` 作为 Kuma 请求头；不要把令牌写进仓库。

## Turnstile

创建名为 `FireflyIv friend request` 的 Managed widget，只允许 `www.fireflyiv.com`。把公开 sitekey 写入 `NEXT_PUBLIC_TURNSTILE_SITE_KEY`，secret 写入服务器 `deploy/.env` 的 `TURNSTILE_SECRET_KEY`，然后重建 web。

友链接口现在采用 fail-closed：任一密钥缺失时页面不展示可提交表单，API 返回 `503`，不会继续匿名入库。
