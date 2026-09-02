---
title: 从“返回 200”到真正可用：给个人站补上内容监控
date: 2026-09-01
category: "运维:ops"
series: "自托管运维:self-hosted-ops"
pinned: false
comment: true
tags: ["监控:monitoring", "Uptime Kuma:kuma", "可用性:availability"]
cover: /covers/self-hosted-ops.svg
description: 状态码正常不代表页面能用。记录如何用关键词和 JSON 查询发现空白页、默认配置与失效后台。
---

## “绿色”也可能是故障

一次巡检中，Uptime Kuma 的八个监控项全部为绿色，但公开状态页是空白页，导航站展示的也是 Dashy 默认欢迎内容。HTTP 探针只确认服务器返回了 `200`，并没有确认浏览器拿到的是 JavaScript、站点配置是否生效，或 API 返回的是否真是 JSON。

这类问题可以称为“假绿”：连接、TLS 和状态码都正常，功能却已经不可用。

## 为不同入口选择断言

现在状态页中的 14 个真实服务入口按内容类型分别检查：

- 普通页面检查稳定的产品或站点标题，例如 `Artalk`、`Umami`、`Beszel`；
- 公开状态页必须包含“FireflyIv 服务状态”；
- Dashy 直接探测 `/conf.yml`，必须包含“FireflyIv 导航”；
- 一言 API 使用 JSONata 表达式 `$type($)`，期望值为 `object`，避免一段 HTML 错误页冒充成功 JSON；
- 后台入口检查登录页或应用外壳的稳定特征，而不依赖易变的按钮文案。

裸域只是跳转到 `www` 的别名，不再占用一项功能监控；它仍由部署后的 HTTP 验收覆盖。

Cloudflare Access 上线后，Shlink、Beszel、Uptime Kuma 后台和 Umami 后台的公网地址都会先进入登录页。监控这些地址只会证明 Access 正常，无法证明源应用正常。因此 Kuma 对受保护的后台改用 `127.0.0.1` 本机端口，公网访客路径则继续由状态页、导航站和 Umami 公开脚本探针覆盖。

## 监控也需要可恢复

监控配置不是一次性的手工点击。仓库中的 `deploy/subsites/kuma/configure-monitors.js` 会先使用 SQLite 在线备份，再在一个事务里更新探针与公开分组。脚本可以重复运行，不会反复创建同一 URL 的监控项。这样重装 Kuma 或迁移服务器时，监控规则也能从版本库恢复。

所有 14 个监控都绑定同一条已启用的邮件通知，配置脚本重复运行也不会创建重复关联。最后的原则很简单：状态码回答“服务端有没有回应”，内容断言才回答“用户拿到的是不是那个网站”。
