import { NextResponse } from "next/server";
import { countChatter, listChatter } from "@/lib/db";

export const dynamic = "force-dynamic";

// GET /api/chatter?before=<id>&limit=<n> —— 公开读取
export async function GET(req: Request) {
  const url = new URL(req.url);
  const rawBefore = url.searchParams.get("before");
  const rawLimit = url.searchParams.get("limit");
  const before = rawBefore && /^\d+$/.test(rawBefore) ? Number(rawBefore) : undefined;
  const limit = Math.min(Math.max(Number(rawLimit) || 20, 1), 50);
  const { items, nextBefore } = listChatter(before, limit);
  return NextResponse.json({ items, nextBefore, total: countChatter() });
}
