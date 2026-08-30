#!/bin/bash
# FireflyIv 仓库一致性：每小时从 GitHub 拉取最新（ff-only，保护本地未提交改动）
LOG=/opt/backups/git-pull.log
cd "$HOME/fireflyiv-blog"
git pull --ff-only origin main >> "$LOG" 2>&1 && echo "$(date '+%F %T') pull OK" >> "$LOG" || echo "$(date '+%F %T') pull 跳过" >> "$LOG"
