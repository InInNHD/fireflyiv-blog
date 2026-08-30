import Link from "next/link";
import PostCard from "@/components/post-card";
import Hitokoto from "@/components/hitokoto";
import { getAllPosts } from "@/lib/blog";
import { getSiteInfo } from "@/lib/site";


export const dynamic = "force-static";

export default function HomePage() {
  const site = getSiteInfo();
  const posts = getAllPosts().slice(0, 6);

  return (
    <div className="space-y-10 pt-10">
      {/* 英雄区 */}
      <section className="card relative overflow-hidden px-6 py-12 text-center sm:py-16">
        <div
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{
            background:
              "radial-gradient(400px 200px at 20% 0%, color-mix(in srgb, var(--accent) 14%, transparent), transparent 70%), radial-gradient(400px 220px at 85% 100%, color-mix(in srgb, var(--accent2) 12%, transparent), transparent 70%)",
          }}
        />
        <div className="relative">
          <div className="mx-auto mb-5 size-20 rounded-2xl bg-surface2 text-4xl shadow-[0_0_30px_color-mix(in_srgb,var(--accent)_35%,transparent)] grid place-items-center">
            ✦
          </div>
          <h1 className="text-glow text-3xl font-bold sm:text-4xl">
            {site.name}
          </h1>
          <p className="mt-3 text-muted">{site.slogan}</p>
          <Hitokoto className="mx-auto mt-3 max-w-md" />
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-muted">
            {site.description}
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link href="/posts" className="btn-accent">
              阅读文章
            </Link>
            <Link href="/chatter" className="btn-accent" style={{ color: "var(--accent2)", borderColor: "color-mix(in srgb, var(--accent2) 40%, var(--line))" }}>
              看看碎碎念
            </Link>
          </div>
        </div>
      </section>

      {/* 最新文章 */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">最新文章</h2>
          <Link href="/posts" className="chip">
            全部 →
          </Link>
        </div>
        {posts.length === 0 ? (
          <div className="card p-8 text-center text-muted">
            还没有文章，快写下第一篇吧 ✍️
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {posts.map((p) => (
              <PostCard key={p.slug} post={p} />
            ))}
          </div>
        )}
      </section>


    </div>
  );
}
