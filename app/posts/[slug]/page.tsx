import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import ArtalkComments from "@/components/artalk-comments";
import PostCover from "@/components/post-cover";
import PostToc from "@/components/post-toc";
import ReadingProgress from "@/components/reading-progress";
import PostViews from "@/components/post-views";
import CodeCopyButtons from "@/components/code-copy-buttons";
import PostCard from "@/components/post-card";
import PostShare from "@/components/post-share";
import { renderMarkdown } from "@/lib/markdown";
import { getAllPosts, getPostBySlug, getRelatedPosts } from "@/lib/blog";
import type { PostMeta } from "@/lib/blog";

interface Props {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return { title: "未找到文章" };
  const SITE_URL = process.env.SITE_URL ?? "https://www.fireflyiv.com";
  const image = post.cover
    ? new URL(post.cover, SITE_URL).toString()
    : new URL(`/posts/${post.slug}/opengraph-image`, SITE_URL).toString();
  return {
    title: post.title,
    description: post.description || undefined,
    alternates: { canonical: `/posts/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.description || undefined,
      type: "article",
      publishedTime: post.date,
      modifiedTime: post.updated,
      tags: post.tags.map((tag) => tag.name),
      images: [{ url: image, width: 1200, height: 630, alt: post.title }],
    },
    twitter: { card: "summary_large_image", title: post.title, description: post.description, images: [image] },
  };
}

function fmtDate(d: string): string {
  const [y, m, day] = d.split("-");
  return `${y} 年 ${Number(m)} 月 ${Number(day)} 日`;
}

function isOutdated(date: string): boolean {
  return Date.now() - Date.parse(`${date}T00:00:00Z`) > 365 * 24 * 60 * 60 * 1000;
}

function PrevNextCard({
  label,
  post,
}: {
  label: string;
  post: PostMeta | null;
}) {
  if (!post) {
    return (
      <div className="card p-4 opacity-40">
        <p className="text-xs text-muted">{label}</p>
        <p className="mt-1 truncate text-sm text-muted">没有啦</p>
      </div>
    );
  }
  return (
    <Link href={`/posts/${post.slug}`} className="card card-hover group block p-4">
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-1 truncate font-medium transition-colors group-hover:text-accent">
        {post.title}
      </p>
      <p className="mt-1 font-mono text-xs text-muted">{post.date}</p>
    </Link>
  );
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const html = await renderMarkdown(post.content);
  const related = getRelatedPosts(post);

  // 上一篇（更新的）/ 下一篇（更旧的），按日期倒序
  const posts = getAllPosts();
  const idx = posts.findIndex((p) => p.slug === slug);
  const newer = idx > 0 ? posts[idx - 1] : null;
  const older = idx >= 0 && idx < posts.length - 1 ? posts[idx + 1] : null;

  return (
    <div className="mx-auto grid max-w-3xl gap-10 pt-8 lg:max-w-4xl lg:grid-cols-[minmax(0,1fr)_13rem] lg:items-start lg:gap-x-10">
      <ReadingProgress />
      <article className="min-w-0 space-y-6">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "BlogPosting",
              headline: post.title,
              datePublished: post.date,
              dateModified: post.updated ?? post.date,
              description: post.description,
              image: post.cover
                ? new URL(post.cover, process.env.SITE_URL ?? "https://www.fireflyiv.com").toString()
                : undefined,
              author: { "@type": "Person", name: "FireflyIv" },
              publisher: {
                "@type": "Organization",
                name: "FireflyIv",
                url: process.env.SITE_URL ?? "https://www.fireflyiv.com",
              },
              mainEntityOfPage:
                (process.env.SITE_URL ?? "https://www.fireflyiv.com") + "/posts/" + post.slug,
            }),
          }}
        />
        <PostCover cover={post.cover} title={post.title} slug={post.slug} className="aspect-[21/9] w-full rounded-2xl border border-line" />
        <header className="space-y-3">
          <h1 className="text-2xl font-bold leading-snug sm:text-3xl">{post.title}</h1>
          <div className="flex flex-wrap items-center gap-3 text-xs text-muted">
            <time dateTime={post.date}>📅 {fmtDate(post.date)}</time>
            {post.updated && <span>✏️ 更新于 {fmtDate(post.updated)}</span>}
            <span>📖 {post.wordCount} 字 · 约 {post.readingMinutes} 分钟</span>
            <PostViews slug={post.slug} />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {post.pinned && <span className="chip !text-accent">📌 置顶</span>}
            {post.category && (
              <Link href={`/categories/${post.category.slug}`} className="chip">📂 {post.category.name}</Link>
            )}
            {post.series && (
              <Link href={`/series/${post.series.slug}`} className="chip">📚 {post.series.name}</Link>
            )}
          </div>
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {post.tags.map((t) => (
                <Link key={t.slug} href={`/tags/${t.slug}`} className="chip">
                  # {t.name}
                </Link>
              ))}
            </div>
          )}
        </header>

        {isOutdated(post.updated ?? post.date) && (
          <aside className="rounded-xl border border-accent2/40 bg-accent2/10 px-4 py-3 text-sm text-muted">
            ⏳ 本文距上次更新已超过一年，部分内容可能已经变化。
          </aside>
        )}

        <div className="markdown-body" dangerouslySetInnerHTML={{ __html: html }} />
        <CodeCopyButtons />

        <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-line pt-6 text-sm">
          <Link href="/posts" className="chip">← 返回文章列表</Link>
          <div className="flex items-center gap-2">
            <PostShare title={post.title} />
            <Link href="/" className="chip">回到首页</Link>
          </div>
        </footer>

        {/* 上一篇 / 下一篇 */}
        <nav aria-label="上一篇下一篇" className="grid gap-3 sm:grid-cols-2">
          <PrevNextCard label="← 上一篇（更新的文章）" post={newer} />
          <PrevNextCard label="下一篇（更早的文章） →" post={older} />
        </nav>

        {related.length > 0 && (
          <section className="space-y-3" aria-labelledby="related-title">
            <h2 id="related-title" className="text-lg font-semibold">相关文章</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((item) => <PostCard key={item.slug} post={item} />)}
            </div>
          </section>
        )}

        {/* 评论区（Artalk 自托管） */}
        {post.comment && <ArtalkComments pageKey={post.slug} pageTitle={post.title} />}
      </article>

      <aside className="hidden min-w-0 lg:block">
        <div className="sticky top-20 max-h-[calc(100vh-6.5rem)] overflow-y-auto">
          <PostToc />
        </div>
      </aside>
    </div>
  );
}
