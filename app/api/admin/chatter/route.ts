import { NextResponse } from "next/server";
import { insertChatter } from "@/lib/db";

export const dynamic = "force-dynamic";

const postLog = new Map<string, number[]>();
const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 60_000;

function rateLimit(req: Request): boolean {
  const key = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "local";
  const now = Date.now();
  const recent = (postLog.get(key) ?? []).filter((time) => now - time < RATE_WINDOW_MS);
  if (recent.length >= RATE_LIMIT) {
    postLog.set(key, recent);
    return false;
  }
  postLog.set(key, [...recent, now]);
  return true;
}

// 此路径同时由 Cloudflare Access 保护；Bearer token 是源站的第二道校验。
export async function POST(req: Request) {
  const token = process.env.CHATTER_TOKEN;
  if (!token) return NextResponse.json({ error: "服务器未配置 CHATTER_TOKEN" }, { status: 500 });
  if ((req.headers.get("authorization") ?? "") !== `Bearer ${token}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!rateLimit(req)) return NextResponse.json({ error: "rate limited" }, { status: 429 });

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const content = String(body.content ?? "").trim().slice(0, 500);
  if (!content) return NextResponse.json({ error: "content 不能为空" }, { status: 400 });
  const mood = String(body.mood ?? "").trim().slice(0, 16) || undefined;
  const rawImg = String(body.img ?? "").trim().slice(0, 500);
  if (rawImg && !/^https:\/\//i.test(rawImg) && !/^\/[a-z0-9/_.,%-]+$/i.test(rawImg)) {
    return NextResponse.json({ error: "图片地址必须是 HTTPS 或站内路径" }, { status: 400 });
  }
  const rawTags = Array.isArray(body.tags) ? body.tags : String(body.tags ?? "").split(/[,，]/);
  const tags = [...new Set(rawTags.map((tag) => String(tag).trim().slice(0, 20)).filter(Boolean))].slice(0, 5);
  return NextResponse.json(insertChatter(content, mood, rawImg || undefined, tags), { status: 201 });
}
