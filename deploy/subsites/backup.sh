#!/bin/bash
# FireflyIv 全站备份：docker 卷 + 博客源码 + 关键配置
set -u
D=$(date +%Y%m%d-%H%M)
OUT=/opt/backups/$D
LOG=/opt/backups/history.log
mkdir -p "$OUT"
echo "== $(date) 备份开始 ==" >> $LOG

# 1) Docker 数据卷（全部 12 个命名卷）
VOLS="deploy_fireflyiv-data deploy_fireflyiv-artalk umami_umami-data lsky_lsky-data shlink_shlink-data hitokoto_hitokoto-data hitokoto_hitokoto-redis-data uptime-kuma-data nav_dashy-icons note_memos-data paste_paste-data"
for v in $VOLS; do
  if docker volume inspect "$v" >/dev/null 2>&1; then
    docker run --rm -v "$v":/data:ro -v "$OUT":/out alpine:3.20 sh -c "tar czf /out/$v.tar.gz -C /data ." >>$LOG 2>&1 && echo "OK  $v" >> $LOG || echo "FAIL $v" >> $LOG
  fi
done

# 2) Beszel 数据（systemd 二进制）
if [ -d /var/lib/beszel ]; then
  sudo -n tar czf "$OUT/beszel-data.tar.gz" -C /var/lib/beszel . >>$LOG 2>&1 && echo "OK  beszel-data" >> $LOG || echo "FAIL beszel-data" >> $LOG
fi

# 3) 博客源码（文章 Markdown 源文件）
tar czf "$OUT/fireflyiv-blog.tar.gz" -C "$HOME/fireflyiv-blog" . >>$LOG 2>&1 && echo "OK  fireflyiv-blog" >> $LOG || echo "FAIL fireflyiv-blog" >> $LOG

# 4) 关键配置
tar czf "$OUT/nginx-conf.tar.gz" -C /etc/nginx/conf.d . >>$LOG 2>&1
tar czf "$OUT/systemd-units.tar.gz" /etc/systemd/system/beszel.service /lib/systemd/system/beszel-agent.service >>$LOG 2>&1
sudo -n cp /etc/cloudflared/token "$OUT/cloudflared-token" >>$LOG 2>&1 && sudo -n chmod 644 "$OUT/cloudflared-token" || echo "WARN cloudflared token 未备份" >> $LOG

# 5) 同步到 Cloudflare R2（异地备份）
if command -v rclone >/dev/null 2>&1; then
  rclone sync /opt/backups firefly-r2:fireflyiv-backups/backups --transfers 4 >>$LOG 2>&1 && echo "OK  R2 同步" >> $LOG || echo "FAIL R2 同步" >> $LOG
fi

# 6) 清理：保留 7 天
find /opt/backups -maxdepth 1 -type d -name "20*" -mtime +7 -exec rm -rf {} ; 2>/dev/null

SIZE=$(du -sh "$OUT" | cut -f1)
echo "== $(date) 备份完成，大小 $SIZE ==" >> $LOG
