import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { parseLrc } from "../lib/lrc.mjs";

const root = process.cwd();
const postsDir = path.join(root, "content", "posts");
const dateOf = (value) => value instanceof Date ? value.toISOString().slice(0, 10) : String(value ?? "");
const slugOf = (value) => String(value ?? "").split(":").at(-1);

for (const name of fs.readdirSync(postsDir).filter((name) => /\.mdx?$/.test(name))) {
  const { data } = matter(fs.readFileSync(path.join(postsDir, name), "utf8"));
  assert(data.title, `${name}: title 缺失`);
  assert(/^\d{4}-\d{2}-\d{2}$/.test(dateOf(data.date)), `${name}: date 必须是 YYYY-MM-DD`);
  for (const value of [data.category, data.series, ...(data.tags ?? [])].filter(Boolean)) {
    assert(/^[a-z0-9-]+$/i.test(slugOf(value)), `${name}: URL slug 必须只含 ASCII 字母、数字或连字符`);
  }
}

const anime = JSON.parse(fs.readFileSync(path.join(root, "content", "anime.json"), "utf8"));
for (const item of anime.items) {
  assert(item.title, "anime.json: title 缺失");
  assert(["watching", "completed", "planned", "paused"].includes(item.status), `${item.title}: status 无效`);
  assert(item.rating == null || (item.rating >= 1 && item.rating <= 10), `${item.title}: rating 应为 1-10`);
}

const gallery = JSON.parse(fs.readFileSync(path.join(root, "content", "gallery.json"), "utf8"));
for (const item of gallery) assert(item.src && item.alt, "gallery.json: 每张图片必须提供 src 和 alt");

const music = JSON.parse(fs.readFileSync(path.join(root, "content", "music.json"), "utf8"));
for (const item of music.tracks) {
  assert(item.title && item.artist && item.src, "music.json: 每首歌必须提供 title、artist 和 src");
  assert(/^https:\/\//.test(item.src) || item.src.startsWith("/"), `${item.title}: src 必须是 HTTPS 或站内路径`);
}
assert.deepEqual(parseLrc("[00:02.50]第二句\n[00:01.00]第一句"), [
  { time: 1, text: "第一句" },
  { time: 2.5, text: "第二句" },
]);

console.log(`content OK: ${fs.readdirSync(postsDir).filter((name) => /\.mdx?$/.test(name)).length} posts, ${anime.items.length} anime, ${gallery.length} gallery, ${music.tracks.length} music tracks`);
