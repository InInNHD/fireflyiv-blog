import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import PostCard from "@/components/post-card";
import { getAllPosts, getAllTags } from "@/lib/blog";

interface Props {
  params: Promise<{ tag: string }>;
}

export function generateStaticParams() {
  return getAllTags().map((t) => ({ tag: t.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tag } = await params;
  const found = getAllTags().find((t) => t.slug === tag);
  return { title: found ? `#${found.name}` : "# 标签" };
}

export default async function TagPage({ params }: Props) {
  const { tag } = await params;
  const found = getAllTags().find((t) => t.slug === tag);
  const posts = getAllPosts().filter((p) => p.tags.some((t) => t.slug === tag));
  if (posts.length === 0) notFound();

  return (
    <div className="space-y-6 pt-8">
      <header className="flex items-center gap-3">
        <h1 className="text-2xl font-bold"># {found?.name ?? tag}</h1>
        <span className="chip">{posts.length} 篇</span>
        <Link href="/tags" className="chip">全部标签</Link>
      </header>
      <div className="grid gap-4 sm:grid-cols-2">
        {posts.map((p) => (
          <PostCard key={p.slug} post={p} />
        ))}
      </div>
    </div>
  );
}
