#!/usr/bin/env python3
# FireflyIv 通用邮件通知：python3 ops/mail.py "标题" < 内容
# SMTP 凭据来自环境变量（由调用方 source deploy/.env），不进仓库。
import sys, os, smtplib
from email.mime.text import MIMEText

subject = sys.argv[1] if len(sys.argv) > 1 else "FireflyIv 通知"
body = sys.stdin.read() or "(空)"
host = os.environ.get("SMTP_HOST") or "smtp.qq.com"
port = int(os.environ.get("SMTP_PORT") or "465")
user = os.environ.get("SMTP_USER") or "firefly1v@qq.com"
pw = os.environ.get("SMTP_PASS")
to = os.environ.get("FRIEND_NOTIFY_TO") or os.environ.get("SMTP_USER") or "firefly1v@qq.com"
if not (host and user and pw and to):
    print("mail.py: SMTP 环境变量缺失，跳过发送")
    sys.exit(0)
msg = MIMEText(body, "plain", "utf-8")
msg["Subject"] = subject
msg["From"] = user
msg["To"] = to
s = smtplib.SMTP_SSL(host, port, timeout=20)
s.login(user, pw)
s.sendmail(user, [to], msg.as_string())
s.quit()
print("mail.py: 邮件已发送到", to)
