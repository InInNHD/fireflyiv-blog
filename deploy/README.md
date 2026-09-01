# 部署指南（腾讯云 + Cloudflare Tunnel）

## 拓扑

```text
访客 → www.fireflyiv.com → Cloudflare 边缘 → 隧道(cloudflared) → 服务器 127.0.0.1:8082 (web)
                                                                  └→ 127.0.0.1:1234 (artalk)
```

## 首次部署

1. **准备服务器**：腾讯云 1 核 2G 及以上，安装 Docker（含 compose 插件）。

2. **上传代码**（任选其一）：
   - git clone 仓库后在服务器上构建；
   - 或本机构建镜像后 docker save/load 传输。

3. **配置环境变量**：
   ```bash
   export CHATTER_TOKEN=$(openssl rand -hex 24)   # 碎碎念发布 token
   ```

4. **启动**：
   ```bash
   cd deploy && docker compose up -d --build
   ```

5. **Cloudflare Tunnel**：
   ```bash
   # 安装 cloudflared
   wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 -O /usr/local/bin/cloudflared
   chmod +x /usr/local/bin/cloudflared

   cloudflared tunnel login
   cloudflared tunnel create fireflyiv
   cloudflared tunnel route dns fireflyiv www.fireflyiv.com

   sudo mkdir -p /etc/cloudflared
   sudo cp deploy/cloudflared/config.yml /etc/cloudflared/
   sudo cp ~/.cloudflared/*.json /etc/cloudflared/

   sudo cp deploy/cloudflared/cloudflared.service /etc/systemd/system/
   sudo systemctl daemon-reload
   sudo systemctl enable --now cloudflared
   ```

6. **验收**：浏览器访问 https://www.fireflyiv.com，或 curl -I https://www.fireflyiv.com

## 本机运行

注意：本项目为 `output: "standalone"`；`npm start` 已改为 `node .next/standalone/server.js`。本地运行方式：

```bash
# 开发
npm run dev

# 生产（构建后）
npm run build
npm start   # = node .next/standalone/server.js（本地 127.0.0.1:3000）
```

## 内容更新与自动发布

- 文章/代码：本地编辑 → git push → 服务器 crontab 每小时运行 `ops/deploy-web.sh`：
  fetch 检测变更 → `git pull --ff-only` → **仅重建 web 镜像** → 替换容器 → 健康检查（127.0.0.1:8082 HTTP 200）；
  健康检查失败自动回滚上一版镜像，全程记录在 /opt/backups/deploy.log。
- 手动全量部署：`cd deploy && bash deploy.sh`（构建全部服务 + 健康检查，不做回滚）。
- 碎碎念：站点内直接发布；
- 评论管理：Artalk 后台（127.0.0.1:1234 或独立子域）。

## 月度升级

第三方镜像按 sha256 摘要固定；升级 = 拉新版本 → 查新摘要 → 替换 compose：

```bash
docker pull 镜像名:新版本    # 先拉到本地
docker images --digests      # 查新摘要
# 替换对应 docker-compose.yml 的 sha256 → docker compose up -d
```

web 依赖升级：本地 `npm update` → `npm run typecheck && npm run build` → 提交推送，CI 通过后服务器自动发布。
> 安全审计注意：国内 npm 镜像（npmmirror 等）不支持 audit 接口，请用
> `npm audit --registry=https://registry.npmjs.org`；CI（GitHub Actions）默认走官方源，无此问题。

## 备份

- 代码与文章：Git 仓库天然备份；
- 运行时数据：data/firefly.db 与 Artalk 的 data.db（Docker volume 内）：
  ```bash
  docker run --rm -v fireflyiv-data:/data -v $(pwd):/backup alpine tar czf /backup/firefly-data.tar.gz -C /data .
  ```