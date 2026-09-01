import { getAllPosts } from "@/lib/blog";

export const dynamic = "force-static";

// 纯文本化：去掉代码块/图片/链接等 markdown 语法，仅用于搜索索引
function plainText(md: string): string {
  return md
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/^#{1,6}\s+/gm, " ")
    .replace(/^>\s?/gm, " ")
    .replace(/[*_~|]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function GET() {
  const posts = getAllPosts().map((p) => ({
    slug: p.slug,
    title: p.title,
    description: p.description,
    date: p.date,
    tags: p.tags,
    category: p.category,
    series: p.series,
    content: plainText(p.content),
  }));
  return Response.json({ posts });
}
