import { insertFriendRequest } from "@/lib/db";
import nodemailer from "nodemailer";

export const dynamic = "force-dynamic";

// 简单内存限流：每 IP 60 秒最多 1 条（单实例足够）
const lastSubmit = new Map<string, number>();

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const now = Date.now();
  const last = lastSubmit.get(ip) ?? 0;
  if (now - last < 60_000) {
    return Response.json({ ok: false, error: "提交太频繁，请稍后再试" }, { status: 429 });
  }
  lastSubmit.set(ip, now);

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: "请求格式错误" }, { status: 400 });
  }
  const name = String(body.name ?? "").trim().slice(0, 60);
  const url = String(body.url ?? "").trim().slice(0, 300);
  const avatar = String(body.avatar ?? "").trim().slice(0, 300);
  const desc = String(body.desc ?? "").trim().slice(0, 200);

  if (!name || !/^https?:\/\/.+/i.test(url)) {
    return Response.json({ ok: false, error: "请填写站点名与合法的 URL" }, { status: 400 });
  }

  insertFriendRequest(name, url, avatar || undefined, desc || undefined);

  // 邮件通知站长
  const smtpHost = process.env.SMTP_HOST;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const notifyTo = process.env.FRIEND_NOTIFY_TO ?? smtpUser;
  if (smtpHost && smtpUser && smtpPass) {
    try {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: 465,
        secure: true,
        auth: { user: smtpUser, pass: smtpPass },
      });
      await transporter.sendMail({
        from: `"FireflyIv 友链申请" <${smtpUser}>`,
        to: notifyTo,
        subject: "[友链申请] " + name,
        text: ["站点名：" + name, "URL：" + url, "头像：" + (avatar || "（未填）"), "简介：" + (desc || "（未填）")].join("\n"),
      });
    } catch {
      // 邮件失败不影响申请入库
    }
  }

  return Response.json({ ok: true });
}
