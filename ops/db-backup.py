#!/usr/bin/env python3
# FireflyIv 数据库一致性备份：对每个卷内的 SQLite 文件用 backup API 导出（在线安全）
import sqlite3, os, sys, glob

OUT = sys.argv[1]  # /opt/backups/<日期>/db
os.makedirs(OUT, exist_ok=True)

TARGETS = {
    "deploy_fireflyiv-data": "/var/lib/docker/volumes/deploy_fireflyiv-data/_data",
    "deploy_fireflyiv-artalk": "/var/lib/docker/volumes/deploy_fireflyiv-artalk/_data",
    "vault_vaultwarden-data": "/var/lib/docker/volumes/vault_vaultwarden-data/_data",
    "uptime-kuma-data": "/var/lib/docker/volumes/uptime-kuma-data/_data",
    "lsky_lsky-data": "/var/lib/docker/volumes/lsky_lsky-data/_data",
    "shlink_shlink-data": "/var/lib/docker/volumes/shlink_shlink-data/_data",
    "note_memos-data": "/var/lib/docker/volumes/note_memos-data/_data",
    "beszel": "/var/lib/beszel/beszel_data",
}

count = 0
for vol, root in TARGETS.items():
    if not os.path.isdir(root):
        continue
    patterns = ["**/*.db", "**/*.sqlite", "**/*.sqlite3", "**/*.sq3"]
    for pat in patterns:
        for f in glob.glob(os.path.join(root, pat), recursive=True):
            rel = os.path.relpath(f, root).replace(os.sep, "__")
            dest = os.path.join(OUT, vol + "__" + rel)
            try:
                src = sqlite3.connect(f)
                dst = sqlite3.connect(dest)
                src.backup(dst)
                dst.close()
                src.close()
                count += 1
                print("OK", vol, rel)
            except Exception as e:
                print("FAIL", vol, rel, str(e)[:80])
print("total sqlite backups:", count)
