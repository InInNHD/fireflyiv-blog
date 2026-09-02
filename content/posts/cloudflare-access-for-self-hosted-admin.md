---
title: 用 Cloudflare Access 收起自托管后台，同时保留 Umami 统计
date: 2026-09-02
category: "运维:ops"
series: "自托管运维:self-hosted-ops"
pinned: false
comment: true
tags: ["Cloudflare:cloudflare", "Access:access", "安全:security"]
cover: /covers/self-hosted-ops.svg
description: 记录如何保护 Shlink、Beszel、Artalk、Uptime Kuma 与 Umami 后台，并为统计脚本和采集接口保留最小公开边界。
---

个人站的后台入口并不因为“只有自己知道域名”就安全。Shlink 管理、服务器监控、评论管理和可用性监控都能影响站点运行，应该在应用登录之外再加一层统一身份边界。

## 按实际路径保护

本站创建了一个只允许站长邮箱的 Access 策略，并把目标分成两类：

- `shlink.fireflyiv.com` 与 `monitor.fireflyiv.com` 整站保护；
- Artalk 只保护 `/sidebar*`，Uptime Kuma 只保护 `/dashboard*`，公开评论 API 和状态页不受影响。

路径级规则比整站套登录墙更重要。前台页面、客户端 API 和公开状态页如果一起被拦截，看似更安全，实际会破坏正常功能。

## Umami 的最小公开例外

Umami 后台位于 `stats.fireflyiv.com`，但主站访客还需要加载 `/script.js`，浏览器也要向 `/api/send` 写入匿名统计。处理方式是让整个统计域默认继承站长邮箱策略，再创建一个目标更具体的应用，仅对这两个精确路径设置 Bypass。

Bypass 不是“关闭整个统计站认证”。它只允许两条公开数据路径绕过 Access，其他页面仍会跳转到 Cloudflare 登录。上线后的验收也分别进行：根路径必须返回 Access 重定向，脚本必须是 `application/javascript`，采集接口不能跳转到登录页。

## 监控绕开登录墙但不绕开应用

Access 保护后，从公网探测后台只会看到登录页。Uptime Kuma 因此通过服务器本机端口检查 Umami、Shlink、Beszel 和自身后台，再用公网探针检查公开脚本、状态页和导航站。身份边界与可观测性各自负责一层，彼此不会制造“假绿”。

最终规则很克制：后台默认不公开，真正需要面向访客的路径逐条列出，并为每条例外留下可重复的验收方法。
