#!/usr/bin/env bash
# FireflyIv Blog 一键部署脚本（服务器端，手动全量部署用）
# 用法：cd deploy && bash deploy.sh
# 生产自动发布走 ops/deploy-web.sh（crontab 每小时），本脚本不做回滚。

set -euo pipefail
cd "$(dirname "$0")"

echo "==> 构建并启动容器"
docker compose up -d --build

echo "==> 等待 web 健康（最多 90s）"
code=""
for _ in $(seq 1 45); do
  code=$(curl -s -o /dev/null -w '%{http_code}' --max-time 5 http://127.0.0.1:8082/ || true)
  [ "$code" = "200" ] && break
  sleep 2
done

if [ "$code" != "200" ]; then
  echo "!! web 健康检查未通过（最后状态码: ${code:-无响应}）"
  echo "   排查：docker compose logs --tail 100 web"
  exit 1
fi

echo "==> 服务状态"
docker compose ps
echo "==> 完成：http://127.0.0.1:8082 已就绪（HTTP 200）"
echo "提醒：生产环境由 crontab 每小时执行 ops/deploy-web.sh 自动发布；本脚本用于手动全量部署。"
