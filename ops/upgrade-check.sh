#!/usr/bin/env bash
# FireflyIv 月度升级检查（每月 1 号 09:00 cron）
# 检查系统包 / Next.js 最新版 / 固定镜像清单，结果写日志并发邮件
set -uo pipefail
LOG=/opt/backups/upgrade-check.log
OUT=$(mktemp)
{
  echo "== FireflyIv 月度升级检查 $(date '+%F %T') =="
  echo "--- 系统可升级包 ---"
  sudo apt-get update -qq 2>/dev/null
  n=$(apt list --upgradable 2>/dev/null | grep -c upgradable)
  echo "数量: $n"
  apt list --upgradable 2>/dev/null | grep upgradable | head -20
  echo "--- Next.js 最新版 ---"
  docker run --rm node:24-alpine npm view next dist-tags.latest 2>/dev/null || echo "查询失败"
  echo "--- 已固定镜像摘要（手动查新版本后替换对应 compose）---"
  grep -rhoE "image: .*@sha256:[0-9a-f]{64}" ~/fireflyiv-blog/deploy 2>/dev/null | sort -u
  echo "--- 行动清单 ---"
  echo "1) 系统安全更新建议 3 天内完成: sudo apt upgrade"
  echo "2) 镜像升级流程见 deploy/README.md「月度升级」"
  echo "3) 前端依赖: 本地 npm update -> typecheck -> build -> CI 通过自动发布"
} > "$OUT" 2>&1
cat "$OUT" >> "$LOG"
set -a; source ~/fireflyiv-blog/deploy/.env 2>/dev/null; set +a
python3 ~/fireflyiv-blog/ops/mail.py "[FireflyIv] 月度升级检查" < "$OUT"
rm -f "$OUT"
