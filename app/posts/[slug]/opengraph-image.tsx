import { notFound } from "next/navigation";
import { getPostBySlug } from "@/lib/blog";
import { makeOgImage, ogSize } from "@/lib/og-image";

export const alt = "FireflyIv 文章封面";
export const size = ogSize;
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();
  return makeOgImage(post.title, post.description || `${post.wordCount} 字 · 约 ${post.readingMinutes} 分钟`);
}
