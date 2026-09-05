#!/usr/bin/env bash
# FireflyIv 备份恢复演练（每月 1 号 10:00 cron）
# 校验最新快照的 SQLite 完整性 + pg_dump 结构 + R2 远端计数，结果发邮件
set -uo pipefail
LOG=/opt/backups/restore-drill.log
OUT=$(mktemp)
{
  echo "== 备份恢复演练 $(date '+%F %T') =="
  python3 ~/fireflyiv-blog/deploy/subsites/restore-check.py
  latest=$(ls -dt /opt/backups/20* 2>/dev/null | head -1)
  echo "最新快照: $latest"
  du -sh "$latest" 2>/dev/null
  echo "文件数: $(find "$latest" -type f | wc -l)"
  echo "--- R2 远端 ---"
  rclone size firefly-crypt: 2>/dev/null | tail -1 || echo "rclone 查询失败"
} > "$OUT" 2>&1
cat "$OUT" >> "$LOG"
set -a; source ~/fireflyiv-blog/deploy/.env 2>/dev/null; set +a
python3 ~/fireflyiv-blog/ops/mail.py "[FireflyIv] 备份恢复演练" < "$OUT"
rm -f "$OUT"
