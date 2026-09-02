#!/bin/bash
# FireflyIv 全站备份 v3：数据库一致性导出 + 文件卷 tar + R2 加密异地同步
set -u
D=$(date +%Y%m%d-%H%M)
OUT=/opt/backups/$D
DB=$OUT/db
LOG=/opt/backups/history.log
mkdir -p "$DB"
echo "== $(date) 备份开始 ==" >> $LOG

# 1) 数据库一致性导出（pg_dump + sqlite backup API，在线安全）
if docker ps --format "{{.Names}}" | grep -q umami-pg; then
  docker exec umami-pg pg_dump -U umami -d umami > "$DB/umami-pg.sql" 2>>$LOG && echo "OK  umami pg_dump" >> $LOG || echo "FAIL umami pg_dump" >> $LOG
fi
sudo -n python3 /home/ubuntu/fireflyiv-blog/ops/db-backup.py "$DB" >>$LOG 2>&1 && echo "OK  sqlite 一致性导出" >> $LOG || echo "FAIL sqlite 导出" >> $LOG

# 2) Docker 数据卷 tar（文件级兜底：图片/附件/redis 等）
VOLS="deploy_fireflyiv-data deploy_fireflyiv-artalk umami_umami-data lsky_lsky-data shlink_shlink-data hitokoto_hitokoto-data hitokoto_hitokoto-redis-data uptime-kuma-data nav_dashy-icons note_memos-data paste_paste-data vault_vaultwarden-data"
for v in $VOLS; do
  if docker volume inspect "$v" >/dev/null 2>&1; then
    if [ "$v" = "hitokoto_hitokoto-redis-data" ]; then
      docker exec hitokoto-redis redis-cli SAVE >/dev/null 2>>$LOG || true
    fi
    docker run --rm -v "$v":/data:ro -v "$OUT":/out alpine:3.20 sh -c "tar --exclude='temp-*.rdb' -czf /out/$v.tar.gz -C /data ." >>$LOG 2>&1 && echo "OK  $v" >> $LOG || echo "FAIL $v" >> $LOG
  fi
done

# 3) Beszel 数据（systemd 二进制）
if [ -d /var/lib/beszel ]; then
  sudo -n tar czf "$OUT/beszel-data.tar.gz" -C /var/lib/beszel . >>$LOG 2>&1 && echo "OK  beszel-data" >> $LOG || echo "FAIL beszel-data" >> $LOG
fi

# 4) 博客源码（文章 Markdown 源文件）
tar czf "$OUT/fireflyiv-blog.tar.gz" -C "$HOME/fireflyiv-blog" . >>$LOG 2>&1 && echo "OK  fireflyiv-blog" >> $LOG || echo "FAIL fireflyiv-blog" >> $LOG

# 5) 关键配置（token 打包进 tar，保持 600 权限，不落明文文件）
tar czf "$OUT/nginx-conf.tar.gz" -C /etc/nginx/conf.d . >>$LOG 2>&1
tar czf "$OUT/systemd-units.tar.gz" /etc/systemd/system/beszel.service /lib/systemd/system/beszel-agent.service >>$LOG 2>&1
sudo -n tar czf "$OUT/cloudflared-token.tar.gz" -C /etc/cloudflared token >>$LOG 2>&1 && echo "OK  cloudflared token" >> $LOG || echo "WARN cloudflared token 未备份" >> $LOG
crontab -l > "$OUT/crontab.txt" 2>>$LOG || true

# 6) 同步到 Cloudflare R2（crypt 加密层）
if command -v rclone >/dev/null 2>&1; then
  rclone sync /opt/backups firefly-crypt: --transfers 4 >>$LOG 2>&1 && echo "OK  R2 加密同步" >> $LOG || echo "FAIL R2 同步" >> $LOG
fi

# 7) 清理：保留 7 天（-exec 转义修复）
find /opt/backups -maxdepth 1 -type d -name "20*" -mtime +7 -exec rm -rf {} \; 2>/dev/null

SIZE=$(du -sh "$OUT" | cut -f1)
echo "== $(date) 备份完成，大小 $SIZE ==" >> $LOG
