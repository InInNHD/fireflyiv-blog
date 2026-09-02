# 公网冒烟检查

任意能访问公网且安装 Node.js 20+ 的机器均可运行：

```bash
npm run check:smoke
```

脚本逐项检查 14 个公网入口，并覆盖以下功能级断言：

- 主站、图床、PrivateBin、Memos、状态页、导航与 Vaultwarden 的稳定页面特征；
- 一言与 Artalk 公共接口必须返回合法 JSON；
- 状态页真实 JS/CSS 不能返回 HTML；
- Shlink、Beszel、Umami 后台、Artalk `/sidebar`、Uptime Kuma `/dashboard` 必须进入 Cloudflare Access；
- Umami `script.js` 必须保持 JavaScript MIME，`/api/send` 不能被 Access 拦截；
- 短链裸域必须回到主站。

部署后的恢复顺序：先运行 `npm run check:smoke` 定位入口，再看 Uptime Kuma 最近心跳；只有主站失败时检查 web 容器与 `/opt/backups/deploy.log`，只有子站失败时检查对应容器、nginx 或 Tunnel hostname。Access 相关失败优先检查应用路径与 Bypass 策略，不要通过取消整站保护临时恢复。
