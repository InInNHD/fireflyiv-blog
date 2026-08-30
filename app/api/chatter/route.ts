import { NextResponse } from "next/server";
import { listChatter, insertChatter } from "@/lib/db";

export const dynamic = "force-dynamic";

// GET /api/chatter?before=<id>&limit=<n> —— 公开读取
export async function GET(req: Request) {
  const url = new URL(req.url);
  const rawBefore = url.searchParams.get("before");
  const rawLimit = url.searchParams.get("limit");
  const before = rawBefore && /^\d+$/.test(rawBefore) ? Number(rawBefore) : undefined;
  const limit = Math.min(Math.max(Number(rawLimit) || 20, 1), 50);
  const { items, nextBefore } = listChatter(before, limit);
  return NextResponse.json({ items, nextBefore });
}

// 简单内存限流：key -> 时间戳数组（每分钟最多 5 条）
const postLog = new Map<string, number[]>();
const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 60_000;

function getClientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  return fwd ? fwd.split(",")[0].trim() : "local";
}

function rateLimit(key: string): boolean {
  const now = Date.now();
  const arr = (postLog.get(key) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  if (arr.length >= RATE_LIMIT) {
    postLog.set(key, arr);
    return false;
  }
  arr.push(now);
  postLog.set(key, arr);
  return true;
}

// POST /api/chatter —— 管理员发布（Bearer token 鉴权）
export async function POST(req: Request) {
  const token = process.env.CHATTER_TOKEN;
  if (!token) {
    return NextResponse.json({ error: "服务器未配置 CHATTER_TOKEN" }, { status: 500 });
  }

  const auth = req.headers.get("authorization") ?? "";
  if (auth !== `Bearer ${token}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const ip = getClientIp(req);
  if (!rateLimit(ip)) {
    return NextResponse.json({ error: "rate limited" }, { status: 429 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const content = String(body.content ?? "").trim().slice(0, 500);
  if (!content) {
    return NextResponse.json({ error: "content 不能为空" }, { status: 400 });
  }
  const mood = String(body.mood ?? "").trim().slice(0, 16) || undefined;
  const img = String(body.img ?? "").trim().slice(0, 500) || undefined;

  const item = insertChatter(content, mood, img);
  return NextResponse.json(item, { status: 201 });
}