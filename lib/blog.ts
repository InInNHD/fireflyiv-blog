import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

export interface Tag {
  name: string; // 显示名
  slug: string; // URL 用 ASCII slug，规避非 ASCII 静态路由的跨平台问题
}

export interface PostMeta {
  slug: string;
  title: string;
  date: string; // YYYY-MM-DD
  updated?: string;
  tags: Tag[];
  description: string;
  draft: boolean;
  cover?: string;
}

export interface Post extends PostMeta {
  content: string;
}

const postsDir = path.join(process.cwd(), "content", "posts");

function slugOf(file: string): string {
  return file.replace(/\.mdx?$/, "");
}

function isValidDate(s: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(s);
}

// gray-matter(js-yaml) 会把 2026-03-01 解析为 Date 对象，这里统一归一化为 YYYY-MM-DD 字符串
// 标签解析：支持 "显示名:slug" 或纯字符串（slug 即显示名）
function parseTags(v: unknown): Tag[] {
  if (!Array.isArray(v)) return [];
  const tags: Tag[] = [];
  for (const item of v) {
    const s = String(item).trim();
    if (!s) continue;
    const idx = s.lastIndexOf(":");
    if (idx > 0 && idx < s.length - 1) {
      tags.push({ name: s.slice(0, idx), slug: s.slice(idx + 1) });
    } else {
      tags.push({ name: s, slug: s });
    }
  }
  return tags;
}

function normalizeDate(v: unknown): string {
  if (typeof v === "string") return v;
  if (v instanceof Date && !Number.isNaN(v.getTime())) {
    const y = v.getFullYear();
    const m = String(v.getMonth() + 1).padStart(2, "0");
    const d = String(v.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }
  return "";
}

export function getAllPosts(): Post[] {
  const files = fs.readdirSync(postsDir).filter((f) => f.endsWith(".md") || f.endsWith(".mdx"));
  const posts: Post[] = [];

  for (const file of files) {
    const raw = fs.readFileSync(path.join(postsDir, file), "utf-8");
    const { data, content } = matter(raw);
    const meta = data as Record<string, unknown>;
    const slug = slugOf(file);

    const date = normalizeDate(meta.date);
    if (!isValidDate(date)) {
      if (process.env.NODE_ENV !== "production") {
        console.warn(`[blog] 跳过 ${file}：date 字段缺失或格式错误（需要 YYYY-MM-DD）`);
      }
      continue;
    }

    posts.push({
      slug,
      title: String(meta.title ?? slug),
      date,
      updated: typeof meta.updated === "string" ? meta.updated : undefined,
      tags: parseTags(meta.tags),
      description: String(meta.description ?? ""),
      draft: meta.draft === true,
      cover: typeof meta.cover === "string" ? meta.cover : undefined,
      content,
    });
  }

  // 生产环境过滤草稿；按日期倒序
  return posts
    .filter((p) => !(p.draft && process.env.NODE_ENV === "production"))
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getPostBySlug(slug: string): Post | null {
  return getAllPosts().find((p) => p.slug === slug) ?? null;
}

export interface TagWithCount extends Tag {
  count: number;
}

export function getAllTags(): TagWithCount[] {
  const map = new Map<string, { name: string; count: number }>();
  for (const p of getAllPosts()) {
    for (const t of p.tags) {
      const cur = map.get(t.slug) ?? { name: t.name, count: 0 };
      map.set(t.slug, { name: t.name, count: cur.count + 1 });
    }
  }
  return [...map.entries()]
    .map(([slug, { name, count }]) => ({ name, slug, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

export function getArchive(): { year: string; months: { month: string; posts: Post[] }[] }[] {
  const posts = getAllPosts();
  const byYear = new Map<string, Map<string, Post[]>>();
  for (const p of posts) {
    const [y, m] = p.date.split("-");
    if (!byYear.has(y)) byYear.set(y, new Map());
    const months = byYear.get(y)!;
    if (!months.has(m)) months.set(m, []);
    months.get(m)!.push(p);
  }
  return [...byYear.entries()]
    .sort((a, b) => (a[0] < b[0] ? 1 : -1))
    .map(([year, months]) => ({
      year,
      months: [...months.entries()]
        .sort((a, b) => (a[0] < b[0] ? 1 : -1))
        .map(([month, posts]) => ({ month, posts })),
    }));
}
