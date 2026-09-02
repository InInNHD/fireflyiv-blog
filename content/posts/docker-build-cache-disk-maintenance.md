---
title: Docker 构建缓存吃满磁盘：一次从告警到自动维护的处理
date: 2026-09-02
category: "运维:ops"
series: "自托管运维:self-hosted-ops"
pinned: false
comment: true
tags: ["Docker:docker", "磁盘:disk", "告警:alerting"]
cover: /covers/self-hosted-ops.svg
description: 记录个人服务器磁盘占用从 72% 降至 56% 的排查过程，以及如何用保留空间的定期清理避免再次堆积。
---

服务器磁盘占用升到 72% 时，业务数据并不是主要来源。`docker system df` 显示构建缓存占用了 11.24 GB，其中约 9.2 GB 可以回收。频繁构建博客镜像会留下旧层，如果只关注正在运行的容器，很容易忽略这部分空间。

## 先确认来源，再清理

这次没有执行范围过大的 `docker system prune -a`，而是只处理 builder cache：

```bash
docker builder prune --force --keep-storage 3GB
```

命令保留最近仍可能复用的 3 GB 构建缓存，释放了约 6.26 GB。处理后磁盘占用从 72% 降到 56%，同时没有删除运行中容器、数据卷或业务镜像。

## 把一次操作变成维护规则

服务器每周日 04:00 执行同一条带保留空间的清理命令，日志写入备份目录。Beszel 的磁盘告警阈值也从 90% 提前到 80%，CPU 保持 90%，内存保持 95%。这样留出了排查和扩容时间，不会等磁盘接近写满才通知。

磁盘维护的重点不是“定期删除所有东西”，而是明确哪些内容可重建、保留多少缓存，以及告警是否早于故障。构建缓存可以回收，数据库卷和上传文件则必须由备份与恢复流程保护，二者不能使用同一把清理锤子。
