#!/usr/bin/env bash
# FireflyIv 自动发布流水线（每小时 crontab 触发）
# 流程：fetch → 无变更即退出 → pull --ff-only → 构建 web 镜像 → 替换容器 → 健康检查
#       健康检查失败自动回滚到上一版镜像（deploy-web:rollback）
set -uo pipefail

REPO="$HOME/fireflyiv-blog"
LOG=/opt/backups/deploy.log
HEALTH_URL=http://127.0.0.1:8082/

log() { echo "$(date '+%F %T') $*" >> "$LOG"; }

cd "$REPO" || { log "仓库不存在，中止"; exit 1; }

git fetch origin main -q || { log "git fetch 失败，中止"; exit 1; }
LOCAL=$(git rev-parse HEAD)
REMOTE=$(git rev-parse origin/main)
[ -n "$LOCAL" ] && [ -n "$REMOTE" ] || { log "无法解析版本号，中止"; exit 1; }

if [ "$LOCAL" = "$REMOTE" ]; then
  log "无变更，跳过（$LOCAL）"
  exit 0
fi

log "检测到变更 $LOCAL -> $REMOTE，开始发布"

if ! git pull --ff-only origin main >> "$LOG" 2>&1; then
  log "git pull 失败，中止"
  exit 1
fi

# 备份当前镜像，供失败回滚
docker tag deploy-web deploy-web:rollback 2>/dev/null || true

cd "$REPO/deploy" || { log "deploy 目录不存在"; exit 1; }

if ! docker compose build web >> "$LOG" 2>&1; then
  log "镜像构建失败，回滚到上一版"
  docker tag deploy-web:rollback deploy-web 2>/dev/null || true
  docker compose up -d --force-recreate web >> "$LOG" 2>&1 || true
  exit 1
fi

docker compose up -d web >> "$LOG" 2>&1

# 健康检查（最多 90s；容器健康但 8082 未就绪也算失败）
ok=0
for _ in $(seq 1 45); do
  code=$(curl -s -o /dev/null -w '%{http_code}' --max-time 5 "$HEALTH_URL" || true)
  if [ "$code" = "200" ]; then ok=1; break; fi
  sleep 2
done

if [ "$ok" = "1" ]; then
  log "发布成功 $REMOTE（$HEALTH_URL HTTP 200）"
  docker rmi deploy-web:rollback 2>/dev/null || true
  exit 0
fi

log "健康检查失败，回滚到上一版镜像"
docker tag deploy-web:rollback deploy-web
docker compose up -d --force-recreate web >> "$LOG" 2>&1 || true
exit 1
