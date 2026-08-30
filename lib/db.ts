import { DatabaseSync } from "node:sqlite";
import fs from "node:fs";
import path from "node:path";

export interface ChatterItem {
  id: number;
  content: string;
  mood: string | null;
  img: string | null;
  created_at: number;
}

const dataDir = path.join(process.cwd(), "data");
const dbPath = path.join(dataDir, "firefly.db");

let db: DatabaseSync | null = null;

export function getDb(): DatabaseSync {
  if (!db) {
    fs.mkdirSync(dataDir, { recursive: true });
    db = new DatabaseSync(dbPath);
    db.exec(`
      CREATE TABLE IF NOT EXISTS chatter (
        id         INTEGER PRIMARY KEY AUTOINCREMENT,
        content    TEXT NOT NULL,
        mood       TEXT,
        img        TEXT,
        created_at INTEGER NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_chatter_created ON chatter(created_at DESC);
    `);
  }
  return db;
}

// 分页读取：before 为游标（id 上限），返回 { items, nextBefore }
export function listChatter(before?: number, limit = 20): { items: ChatterItem[]; nextBefore: number | null } {
  const d = getDb();
  const rows = before
    ? d.prepare("SELECT id, content, mood, img, created_at FROM chatter WHERE id < ? ORDER BY id DESC LIMIT ?").all(before, limit)
    : d.prepare("SELECT id, content, mood, img, created_at FROM chatter ORDER BY id DESC LIMIT ?").all(limit);
  const items = rows as unknown as ChatterItem[];
  const nextBefore = items.length === limit ? items[items.length - 1].id : null;
  return { items, nextBefore };
}

export interface FriendRequest {
  id: number;
  name: string;
  url: string;
  avatar: string | null;
  desc: string | null;
  created_at: number;
}

export function insertFriendRequest(
  name: string,
  url: string,
  avatar?: string,
  desc?: string
): FriendRequest {
  const d = getDb();
  d.exec(`
      CREATE TABLE IF NOT EXISTS friend_requests (
        id         INTEGER PRIMARY KEY AUTOINCREMENT,
        name       TEXT NOT NULL,
        url        TEXT NOT NULL,
        avatar     TEXT,
        desc       TEXT,
        created_at INTEGER NOT NULL
      );
    `);
  const now = Date.now();
  const res = d
    .prepare("INSERT INTO friend_requests (name, url, avatar, desc, created_at) VALUES (?, ?, ?, ?, ?)")
    .run(name, url, avatar ?? null, desc ?? null, now);
  return { id: Number(res.lastInsertRowid), name, url, avatar: avatar ?? null, desc: desc ?? null, created_at: now };
}

export function insertChatter(content: string, mood?: string, img?: string): ChatterItem {
  const d = getDb();
  const now = Date.now();
  const res = d
    .prepare("INSERT INTO chatter (content, mood, img, created_at) VALUES (?, ?, ?, ?)")
    .run(content, mood ?? null, img ?? null, now);
  const id = Number(res.lastInsertRowid);
  return { id, content, mood: mood ?? null, img: img ?? null, created_at: now };
}