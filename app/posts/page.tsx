import type { Metadata } from "next";
import PostCard from "@/components/post-card";
import { getListedPosts } from "@/lib/blog";

export const metadata: Metadata = { title: "文章", alternates: { canonical: "/posts" } };

export default function PostsPage() {
  const posts = getListedPosts();

  return (
    <div className="space-y-6 pt-8">
      <header>
        <h1 className="text-2xl font-bold">文章</h1>
        <p className="mt-1 text-sm text-muted">共 {posts.length} 篇 · 按时间倒序</p>
      </header>
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
