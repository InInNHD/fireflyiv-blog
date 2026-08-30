import { getAllPosts } from "@/lib/blog";
import { getSiteInfo } from "@/lib/site";

export const dynamic = "force-static";

const SITE_URL = process.env.SITE_URL ?? "https://www.fireflyiv.com";

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

// 正文摘要：去掉 markdown 语法符号，用于 description
function excerpt(md: string): string {
  return md
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^>\s?/gm, "")
    .replace(/[*_~|]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 300);
}

export function GET() {
  const site = getSiteInfo();
  const posts = getAllPosts().slice(0, 20);

  const items = posts
    .map((p) => {
      const url = SITE_URL + "/posts/" + p.slug;
      return [
        "  <item>",
        "    <title>" + esc(p.title) + "</title>",
        "    <link>" + url + "</link>",
        "    <guid isPermaLink=\"true\">" + url + "</guid>",
        "    <pubDate>" + new Date(p.date + "T00:00:00Z").toUTCString() + "</pubDate>",
        "    <description>" + esc(p.description || excerpt(p.content)) + "</description>",
        "  </item>",
      ].join("\n");
    })
    .join("\n");

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
    "  <channel>",
    "    <title>" + esc(site.name) + "</title>",
    "    <link>" + SITE_URL + "</link>",
    "    <description>" + esc(site.description) + "</description>",
    "    <language>zh-CN</language>",
    "    <lastBuildDate>" + new Date().toUTCString() + "</lastBuildDate>",
    "    <atom:link href=\"" + SITE_URL + "/feed.xml\" rel=\"self\" type=\"application/rss+xml\" />",
    items,
    "  </channel>",
    "</rss>",
  ].join("\n") + "\n";

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
