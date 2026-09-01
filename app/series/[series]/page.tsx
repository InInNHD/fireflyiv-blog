import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import PostCard from "@/components/post-card";
import { getAllPosts, getAllSeries } from "@/lib/blog";

interface Props { params: Promise<{ series: string }> }

export function generateStaticParams() {
  return getAllSeries().map((item) => ({ series: item.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { series } = await params;
  const found = getAllSeries().find((item) => item.slug === series);
  return { title: found?.name ?? "系列", alternates: { canonical: `/series/${series}` } };
}

export default async function SeriesDetailPage({ params }: Props) {
  const { series } = await params;
  const found = getAllSeries().find((item) => item.slug === series);
  const posts = getAllPosts().filter((post) => post.series?.slug === series).reverse();
  if (!found || posts.length === 0) notFound();
  return (
    <div className="space-y-6 pt-8">
      <header className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold">📚 {found.name}</h1><span className="chip">{posts.length} 篇</span><Link href="/series" className="chip">全部系列</Link>
      </header>
      <div className="grid gap-4 sm:grid-cols-2">{posts.map((post) => <PostCard key={post.slug} post={post} />)}</div>
    </div>
  );
}
