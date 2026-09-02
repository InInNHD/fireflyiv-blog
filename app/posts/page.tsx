import type { Metadata } from "next";
import Link from "next/link";
import PostCard from "@/components/post-card";
import { getAllCategories, getAllSeries, getListedPosts } from "@/lib/blog";

export const metadata: Metadata = { title: "文章", alternates: { canonical: "/posts" } };

export default function PostsPage() {
  const posts = getListedPosts();
  const categories = getAllCategories();
  const series = getAllSeries();

  return (
    <div className="space-y-6 pt-8">
      <header>
        <h1 className="text-2xl font-bold">文章</h1>
        <p className="mt-1 text-sm text-muted">共 {posts.length} 篇 · 按时间倒序</p>
      </header>
      {(categories.length > 0 || series.length > 0) && (
        <nav aria-label="文章快捷筛选" className="flex flex-wrap gap-2">
          {categories.map((item) => <Link key={`category-${item.slug}`} href={`/categories/${item.slug}`} className="chip">📂 {item.name} · {item.count}</Link>)}
          {series.map((item) => <Link key={`series-${item.slug}`} href={`/series/${item.slug}`} className="chip">📚 {item.name} · {item.count}</Link>)}
        </nav>
      )}
      {posts.length === 0 ? (
        <div className="card p-8 text-center text-muted">还没有文章 ✍️</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {posts.map((p) => (
            <PostCard key={p.slug} post={p} />
          ))}
        </div>
      )}
    </div>
  );
}
