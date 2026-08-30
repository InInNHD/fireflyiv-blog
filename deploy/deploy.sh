#!/usr/bin/env bash
# FireflyIv Blog 一键部署脚本（服务器端）
# 用法：cd deploy && bash deploy.sh

set -euo pipefail
cd "$(dirname "$0")"

echo "==> 构建并启动容器"
docker compose up -d --build

echo "==> 检查服务状态"
docker compose ps

echo "==> 验证 web"
sleep 3
curl -fsS -o /dev/null -w "web -> HTTP %{http_code}\n" http://127.0.0.1:3000 || echo "web 未就绪"

echo "==> 完成"
echo "提醒：若尚未配置 Cloudflare Tunnel，请参照 deploy/cloudflared/ 下的说明。"