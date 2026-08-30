---
title: 博客分站集群上线：统计、一言、图床、短链
date: 2026-08-30
tags: ["部署:deploy", "自托管:selfhost"]
cover: https://i.fireflyiv.com/i/2026/08/30/6a9324ddada4b.png
description: 记录给 fireflyiv.com 加上 stats / api / i / go 四个子域分站的完整过程：Cloudflare Tunnel 接入、镜像拉取踩坑、以及四个服务的调优细节。
---

主站（www）上线之后，博客缺的能力都补上了：统计、一言、图床、短链。
这篇文章记录这轮分站建设的完整过程，也当给自己留一份排障笔记。

## 拆分子域的思路

主站只做博客该做的事：文章、碎碎念、评论。其余能力全部用子域承载，互不干扰、各管备份：

| 子域 | 服务 | 用途 |
|---|---|---|
| stats.fireflyiv.com | Umami | 全站访问统计（主站已埋点） |
| api.fireflyiv.com | Hitokoto | 自建一言 API（主站首页已切换使用） |
| i.fireflyiv.com | Lsky Pro | 图床（本文封面即来自它） |
| go.fireflyiv.com | Shlink | 短链（无效访问自动 302 回主站） |
| shlink.fireflyiv.com | Shlink Web | 短链管理界面 |
| talk.fireflyiv.com | Artalk | 评论（更早之前上线） |

所有服务只绑定服务器 127.0.0.1，公网入口统一走 Cloudflare Tunnel 的 Public Hostname，
安全组至今依旧只开放 22 端口。主机端口统一使用 8700 段（8700 umami / 8702 hitokoto / 8703 lsky / 8704 shlink / 8705 shlink-web），
Postgres 与 Redis 只在容器网络内互通，不映射到主机。

## 踩坑记录

### 1. 国内服务器拉 ghcr 超时

Umami 官方镜像只发布在 ghcr.io，直连时好时坏。
解法：南京大学镜像站 `ghcr.nju.edu.cn` 前缀 + 直连多次重试组合拳；
Docker Hub 的热门镜像（shlink/postgres/redis）则交给腾讯云默认加速器。

### 2. 公共加速器对"未缓存镜像"直接 403

Hitokoto 和 Lsky 的镜像不在加速器缓存白名单里，所有代理前缀都 403。
最终：hitokoto 走直连成功（**镜像名是 `hitokoto/api`，不是想当然的 `hitokoto/hitokoto-api`**），
Lsky 用社区维护的 `dko0/lsky-pro`。

### 3. Hitokoto 依赖 Redis，且默认连 127.0.0.1

容器启动后连不上 Redis 会重试 3 次直接退出，容器无限重启。
官方支持**点号环境变量覆盖配置**（`redis.host=服务名`），
配合 compose 的 healthcheck + depends_on 条件等待 Redis 就绪，问题解决。

### 4. Lsky Pro 安装向导的 SQLite 坑

- 需要先 `touch` 出空的 database.sqlite 再提交安装，否则报 "Database does not exist"；
- 表单没有 `_token` 隐藏域，CSRF 校验走 `X-CSRF-TOKEN` 请求头；
- SQLite 文件必须放在**已挂载卷**的路径里，容器重建才不丢数据；
- 安装完成后记得把存储策略的 URL 前缀从内网地址改成公网子域（默认生成的是 `http://127.0.0.1:8703/i`，外链全是错的）。

### 5. Shlink v5 的两个变化

- 重定向配置键名加了 `DEFAULT_` 前缀（`DEFAULT_BASE_URL_REDIRECT` 等），
  配好后访问根路径/无效短码会 302 优雅回主站，而不是一个裸 404；
- API key 必须是 UUID 格式，用 `shlink api-key:generate` 生成。

### 6. 隧道选错，子域全部 000

面板里存在一条已停用的旧隧道。把 hostname 加到错误的隧道后，
DNS 解析正常、本地端口正常，但公网访问永远是 TLS 握手失败。
教训：加路由前先确认隧道是 Active 状态；这次把管理界面域名换到
shlink.fireflyiv.com 挂回正确隧道后秒通。

## 主站联动

- 首页/碎碎念的「一言」从公共 API 切换为自建 api.fireflyiv.com，
  句子库 1 万条同步在自建 Redis，数据自持、断网不慌；
- 全站接入 Umami 埋点（stats.fireflyiv.com/script.js），访客数据留在自己服务器。

> 萤火虽微，愿为其芒。小站从此有了自己的基础设施，数据都在自己手里。
