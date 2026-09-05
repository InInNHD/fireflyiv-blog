# Artalk 配置模板（脱敏版）——线上真实配置在服务器卷 deploy_fireflyiv-artalk/_data/artalk.yml
# 本文档供重建/审计参考；含 SMTP 密码与 Turnstile 密钥的真实值只在服务器卷与 deploy/.env。
# 关键项（与默认差异）：
#   locale: zh-CN
#   http.proxy_header: X-Forwarded-For（Cloudflare 后取真实 IP）
#   captcha: captcha_type: turnstile + site_key/secret_key（与友链表单共用 deploy/.env 的 Turnstile 密钥）
#   email: enabled: true, send_type: smtp, host smtp.qq.com:465, 账号 firefly1v@qq.com（密码=deploy/.env 的 SMTP_PASS）
#   admin_notify.email: enabled: true（新评论/回复发邮件给管理员）
#   frontend.darkMode: inherit（跟随主站深色模式）
#   moderator.pending_default: false（验证码通过即发布；要全人工审核改为 true）
# 修改线上配置：sudo nano /var/lib/docker/volumes/deploy_fireflyiv-artalk/_data/artalk.yml 后 docker restart fireflyiv-artalk
