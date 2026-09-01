import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import PostCard from "@/components/post-card";
import { getAllCategories, getAllPosts } from "@/lib/blog";

interface Props { params: Promise<{ category: string }> }

export function generateStaticParams() {
  return getAllCategories().map((item) => ({ category: item.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;
  const found = getAllCategories().find((item) => item.slug === category);
  return { title: found?.name ?? "分类", alternates: { canonical: `/categories/${category}` } };
}

export default async function CategoryPage({ params }: Props) {
  const { category } = await params;
  const found = getAllCategories().find((item) => item.slug === category);
  const posts = getAllPosts().filter((post) => post.category?.slug === category);
  if (!found || posts.length === 0) notFound();
  return (
    <div className="space-y-6 pt-8">
      <header className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold">📂 {found.name}</h1><span className="chip">{posts.length} 篇</span><Link href="/categories" className="chip">全部分类</Link>
      </header>
      <div className="grid gap-4 sm:grid-cols-2">{posts.map((post) => <PostCard key={post.slug} post={post} />)}</div>
    </div>
  );
}
