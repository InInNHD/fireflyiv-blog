# 部署指南（腾讯云 + Cloudflare Tunnel）

## 拓扑

```text
访客 → www.fireflyiv.com → Cloudflare 边缘 → 隧道(cloudflared) → 服务器 127.0.0.1:8080 (web)
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

注意：本项目为 `output: "standalone"`，**不支持 `next start`**（Next 15.5+ 会直接报错）。本地运行方式：

```bash
# 开发
npm run dev

# 生产（构建后）
npm run build
cd .next/standalone && PORT=3000 HOSTNAME=127.0.0.1 node server.js
```

## 内容更新

- 文章：本地编辑 content/posts/*.md → 提交 → docker compose up -d --build；
- 碎碎念：站点内直接发布（M3 接入后）；
- 评论管理：Artalk 后台（127.0.0.1:1234 或独立子域）。

## 备份

- 代码与文章：Git 仓库天然备份；
- 运行时数据：data/firefly.db 与 Artalk 的 data.db（Docker volume 内）：
  ```bash
  docker run --rm -v fireflyiv-data:/data -v $(pwd):/backup alpine tar czf /backup/firefly-data.tar.gz -C /data .
  ```