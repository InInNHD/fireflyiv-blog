---
title: Cloudflare Tunnel 部署笔记
date: 2026-02-26
tags: ["部署:deploy", "运维:ops"]
cover: /covers/cloudflared-tunnel.svg
description: 把博客部署到腾讯云并通过 Cloudflare Tunnel 穿透的经验记录：不暴露端口、自动 HTTPS、内网服务安全访问。
---

## 为什么用 Tunnel

腾讯云的服务器本身有公网 IP，但直接开 80/443 意味着：

- 需要完成 ICP 备案（域名解析到国内服务器）；
- 服务器直接暴露在公网扫描之下，需要额外加固。

Cloudflare Tunnel（cloudflared）的思路是：**服务器主动向外发起一条长连接**，
公网流量经 Cloudflare 边缘节点通过这条连接转发进来。
对服务器而言，进方向完全不需要开端口，也不用担心源站 IP 泄露。

## 工作方式

```text
访客 → www.fireflyiv.com (Cloudflare 边缘)
              ↓ 隧道
        cloudflared → 127.0.0.1:3000 (Next.js)
                    → 127.0.0.1:1234 (Artalk 评论)
```

## 关键步骤

1. 域名托管到 Cloudflare（或使用 named tunnel 的 CNAME 接入）；
2. 服务器安装 cloudflared 并登录授权：

```bash
cloudflared tunnel login
cloudflared tunnel create fireflyiv
```

3. 配置 DNS 路由：

```bash
cloudflared tunnel route dns fireflyiv www.fireflyiv.com
```

4. 编写 config.yml，把域名指到本地服务，service 常驻运行；
5. 证书由 Cloudflare 自动签发与续期，浏览器访问即是 HTTPS。

> 提示：Cloudflare Tunnel 免费额度对个人博客完全够用；如需国内直连体验，
> 也可以退化为「备案 + 直接解析」的传统方案，两者互不影响。

详细配置模板见仓库 `deploy/` 目录。