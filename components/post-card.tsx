import Link from "next/link";
import type { PostMeta } from "@/lib/blog";
import PostCover from "./post-cover";

function fmtDate(d: string): string {
  const [y, m, day] = d.split("-");
  return `${y} 年 ${Number(m)} 月 ${Number(day)} 日`;
}

export default function PostCard({ post }: { post: PostMeta }) {
  return (
    <Link
      href={`/posts/${post.slug}`}
      className="card card-hover group block overflow-hidden"
    >
      <PostCover cover={post.cover} title={post.title} slug={post.slug} className="h-36 w-full" />
      <div className="p-5 pt-4">
      <div className="mb-2 flex items-center justify-between gap-3 text-xs text-muted">
        <span className="flex flex-wrap items-center gap-1.5">
          <time dateTime={post.date}>{fmtDate(post.date)}</time>
          {post.pinned && <span className="text-accent">置顶</span>}
          {post.category && <span>· {post.category.name}</span>}
        </span>
        {post.tags.length > 0 && (
          <div className="flex flex-wrap justify-end gap-1">
            {post.tags.slice(0, 3).map((t) => (
              <span key={t.slug} className="chip" aria-hidden>
                # {t.name}
              </span>
            ))}
          </div>
        )}
      </div>
      <h3 className="text-lg font-semibold transition-colors group-hover:text-accent">
        {post.title}
      </h3>
      {post.description && (
        <p className="mt-1.5 line-clamp-2 text-sm text-muted">{post.description}</p>
      )}
      <p className="mt-3 text-xs text-muted">{post.wordCount} 字 · 约 {post.readingMinutes} 分钟</p>
      </div>
    </Link>
  );
}
