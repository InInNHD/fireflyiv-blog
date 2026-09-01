---
title: Nginx 反代 SPA：为什么 proxy_pass 多一个路径就会白屏
date: 2026-09-01
category: "运维:ops"
series: "自托管运维:self-hosted-ops"
pinned: false
comment: true
tags: ["Nginx:nginx", "排障:debugging", "反向代理:reverse-proxy"]
description: 用 Uptime Kuma 状态页的真实故障，解释 proxy_pass URI 替换、静态资源 MIME 错误与相对跳转。
---

## 故障现象

`status.fireflyiv.com` 打开后只有空白背景。开发者工具会发现模块脚本和样式无法加载，而直接请求 `/assets/*.js`、CSS、状态页 API 时，返回的 `Content-Type` 全是 `text/html`。

问题不在前端构建，而在这一类配置：

```nginx
location / {
    proxy_pass http://127.0.0.1:3001/status/firefly/;
}
```

`proxy_pass` 带 URI 时，Nginx 会替换匹配到的 location 部分。于是浏览器请求 `/assets/app.js`，源站实际收到的却是 `/status/firefly/assets/app.js`；Uptime Kuma 的 SPA 回退又把它变成 HTML，最终造成脚本 MIME 错误。

## 正确拆分入口

根路径只负责跳转，其他路径不改写：

```nginx
absolute_redirect off;

location = / {
    return 302 /status/firefly;
}

location / {
    proxy_pass http://127.0.0.1:3001;
}
```

`absolute_redirect off` 也很重要。Cloudflare Tunnel 到源站使用 HTTP 和本地端口，如果让 Nginx自动生成绝对地址，可能得到带内部端口的 `http://...:8708/`。相对 Location 由访客当前的 HTTPS 上下文解析，不会泄露源站细节。

## 验收不只看首页

修复后分别验证三层：根路径返回相对跳转；从真实 HTML 中提取的 JS/CSS 返回正确 MIME；公开 API 和心跳接口返回 JSON。只有三层同时通过，才算真正修好一个 SPA 反代。
