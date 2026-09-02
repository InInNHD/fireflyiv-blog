import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import sharp from "sharp";
import { parseLrc } from "../lib/lrc.mjs";

const root = process.cwd();
const postsDir = path.join(root, "content", "posts");
const dateOf = (value) => value instanceof Date ? value.toISOString().slice(0, 10) : String(value ?? "");
const slugOf = (value) => String(value ?? "").split(":").at(-1);
const isDate = (value) => {
  const date = dateOf(value);
  return /^\d{4}-\d{2}-\d{2}$/.test(date) && new Date(`${date}T00:00:00Z`).toISOString().slice(0, 10) === date;
};
const isWebUrl = (value) => {
  try { return new URL(value).protocol === "https:"; } catch { return false; }
};
const checkAsset = (value, label) => {
  assert(typeof value === "string" && value.trim(), `${label}: 路径不能为空`);
  if (value.startsWith("/")) {
    const relative = value.split(/[?#]/, 1)[0].replace(/^\/+/, "");
    const absolute = path.join(root, "public", relative);
    assert(fs.existsSync(absolute), `${label}: 找不到 public/${relative}`);
    return absolute;
  } else {
    assert(isWebUrl(value), `${label}: 必须是 HTTPS 或站内路径`);
    return null;
  }
};

const postSlugs = new Set();

for (const name of fs.readdirSync(postsDir).filter((name) => /\.mdx?$/.test(name))) {
  const { data, content } = matter(fs.readFileSync(path.join(postsDir, name), "utf8"));
  const slug = name.replace(/\.mdx?$/, "").toLowerCase();
  assert(/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug), `${name}: 文件名必须是 ASCII kebab-case`);
  assert(!postSlugs.has(slug), `${name}: slug 重复`);
  postSlugs.add(slug);
  assert(data.title, `${name}: title 缺失`);
  assert(data.description, `${name}: description 缺失`);
  assert(isDate(data.date), `${name}: date 必须是有效的 YYYY-MM-DD`);
  if (data.updated) assert(isDate(data.updated), `${name}: updated 必须是有效的 YYYY-MM-DD`);
  for (const value of [data.category, data.series, ...(data.tags ?? [])].filter(Boolean)) {
    assert(/^[a-z0-9-]+$/i.test(slugOf(value)), `${name}: URL slug 必须只含 ASCII 字母、数字或连字符`);
  }
  const tagSlugs = (data.tags ?? []).map(slugOf);
  assert.equal(new Set(tagSlugs).size, tagSlugs.length, `${name}: tags 存在重复 slug`);
  if (data.cover) checkAsset(data.cover, `${name}: cover`);
  for (const match of content.matchAll(/!\[([^\]]*)\]\(([^)\s]+)(?:\s+["'][^)]*)?\)/g)) {
    assert(match[1].trim(), `${name}: 正文图片缺少 alt 文本`);
    checkAsset(match[2], `${name}: 正文图片`);
  }
}

const anime = JSON.parse(fs.readFileSync(path.join(root, "content", "anime.json"), "utf8"));
const animeTitles = new Set();
for (const item of anime.items) {
  assert(item.title, "anime.json: title 缺失");
  assert(!animeTitles.has(item.title), `${item.title}: 条目重复`);
  animeTitles.add(item.title);
  assert(["watching", "completed", "planned", "paused"].includes(item.status), `${item.title}: status 无效`);
  assert(item.rating == null || (item.rating >= 1 && item.rating <= 10), `${item.title}: rating 应为 1-10`);
  if (item.cover) checkAsset(item.cover, `${item.title}: cover`);
  if (item.url) assert(isWebUrl(item.url), `${item.title}: url 必须是 HTTPS`);
}

const gallery = JSON.parse(fs.readFileSync(path.join(root, "content", "gallery.json"), "utf8"));
const gallerySources = new Set();
const galleryHashes = new Set();
for (const item of gallery) {
  assert(item.src && item.alt, "gallery.json: 每张图片必须提供 src 和 alt");
  assert(item.alt !== "请填写准确的图片描述", `${item.src}: 请填写真实 alt 文本`);
  assert(!gallerySources.has(item.src), `${item.src}: 图片重复`);
  gallerySources.add(item.src);
  const absolute = checkAsset(item.src, `${item.src}: src`);
  if (absolute) {
    const bytes = fs.readFileSync(absolute);
    assert(bytes.length <= 2 * 1024 * 1024, `${item.src}: 图片超过 2 MiB`);
    const hash = crypto.createHash("sha256").update(bytes).digest("hex");
    assert(!galleryHashes.has(hash), `${item.src}: 图片内容重复`);
    galleryHashes.add(hash);
    const metadata = await sharp(bytes).metadata();
    assert(metadata.width && metadata.height, `${item.src}: 无法读取图片尺寸`);
    assert(metadata.width <= 2560 && metadata.height <= 2560, `${item.src}: 图片尺寸超过 2560×2560`);
    if (item.width != null) assert.equal(item.width, metadata.width, `${item.src}: width 与文件不符`);
    if (item.height != null) assert.equal(item.height, metadata.height, `${item.src}: height 与文件不符`);
  }
  if (item.avif) checkAsset(item.avif, `${item.src}: avif`);
  if (item.thumbnail) checkAsset(item.thumbnail, `${item.src}: thumbnail`);
  if (item.date) assert(isDate(item.date), `${item.src}: date 必须是有效的 YYYY-MM-DD`);
}

const music = JSON.parse(fs.readFileSync(path.join(root, "content", "music.json"), "utf8"));
const tracks = new Set();
for (const item of music.tracks) {
  assert(item.title && item.artist && item.src, "music.json: 每首歌必须提供 title、artist 和 src");
  const key = `${item.title}\0${item.artist}`;
  assert(!tracks.has(key), `${item.title} - ${item.artist}: 曲目重复`);
  tracks.add(key);
  checkAsset(item.src, `${item.title}: src`);
  if (item.cover) checkAsset(item.cover, `${item.title}: cover`);
  if (item.lyrics) assert(parseLrc(item.lyrics).length > 0, `${item.title}: lyrics 不含有效 LRC 时间轴`);
}

const links = JSON.parse(fs.readFileSync(path.join(root, "content", "links.json"), "utf8"));
const linkUrls = new Set();
for (const item of links) {
  assert(item.name && item.url && item.avatar && item.desc, "links.json: 每条友链必须提供 name、url、avatar 和 desc");
  assert(isWebUrl(item.url), `${item.name}: url 必须是 HTTPS`);
  assert(!linkUrls.has(item.url), `${item.name}: url 重复`);
  linkUrls.add(item.url);
  checkAsset(item.avatar, `${item.name}: avatar`);
}

const site = JSON.parse(fs.readFileSync(path.join(root, "content", "site.json"), "utf8"));
checkAsset(site.avatar, "site.json: avatar");
for (const [name, value] of Object.entries(site.social ?? {})) {
  if (!value || name === "email") continue;
  if (String(value).startsWith("/")) assert(/^\/[a-z0-9/_-]+(?:\.[a-z0-9]+)?$/i.test(value), `site.json: social.${name} 站内路径无效`);
  else assert(isWebUrl(value), `site.json: social.${name} 必须是 HTTPS`);
}

assert.deepEqual(parseLrc("[00:02.50]第二句\n[00:01.00]第一句"), [
  { time: 1, text: "第一句" },
  { time: 2.5, text: "第二句" },
]);

console.log(`content OK: ${postSlugs.size} posts, ${anime.items.length} anime, ${gallery.length} gallery, ${music.tracks.length} music tracks, ${links.length} links`);
