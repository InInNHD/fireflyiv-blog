---
title: Dashy v4 配置不生效：容器卷挂载路径排查
date: 2026-09-01
category: "运维:ops"
series: "自托管运维:self-hosted-ops"
pinned: false
comment: true
tags: ["Docker:docker", "Dashy:dashy", "排障:debugging"]
description: 配置文件就在宿主机上，容器却一直显示默认页——一次由版本升级引起的挂载路径迁移。
---

导航站的 `conf.yml` 已经写好“博客、内容服务、数据与监控、订阅”四组入口，但线上始终显示 Dashy 默认欢迎页。检查容器挂载后才发现，自定义文件仍被放在旧位置 `/app/public/conf.yml`。

Dashy v4 的运行时配置位于 `/app/user-data/conf.yml`，构建产物中还会出现 `/app/dist/conf.yml`。容器里的 `public/conf.yml` 虽然内容正确，却不是当前版本实际读取的文件。

Compose 中只需要改一行：

```yaml
volumes:
  - ./conf.yml:/app/user-data/conf.yml:ro
```

随后使用 `docker compose up -d --force-recreate` 重新创建容器。`ro` 可以阻止应用意外覆盖仓库中的声明式配置。

这次排障留下两个习惯。第一，升级镜像后不要只看容器“Up”，要在容器内确认配置读取路径；第二，验收配置型 SPA 时直接请求它的配置资源，并检查站点标题与分组数量。这样默认页即使返回 200，也会被内容监控立即发现。
