import Link from "next/link";
import PostCard from "@/components/post-card";
import Hitokoto from "@/components/hitokoto";
import { getListedPosts } from "@/lib/blog";
import { getAnimeData, getSiteInfo } from "@/lib/site";


export const dynamic = "force-static";

export default function HomePage() {
  const site = getSiteInfo();
  const anime = getAnimeData();
  const posts = getListedPosts().slice(0, 6);
  const watching = anime.items.find((item) => item.status === "watching");
  const now = [
    { icon: "📺", label: "追番", value: watching?.title ?? "片单持续更新", href: "/anime" },
    site.now?.game ? { icon: "🎮", label: "在玩", value: site.now.game } : null,
    { icon: "🎧", label: "在听", value: site.now?.music || "打开音乐与歌词", href: "/music" },
    site.now?.note ? { icon: "✨", label: "近况", value: site.now.note } : null,
  ].filter(Boolean) as { icon: string; label: string; value: string; href?: string }[];

  return (
    <div className="space-y-10 pt-10">
      {/* 英雄区 */}
      <section className="glass-panel glass-feature relative overflow-hidden px-6 py-12 text-center sm:py-16">
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

      <section aria-labelledby="now-title">
        <div className="mb-4 flex items-center justify-between">
          <h2 id="now-title" className="text-xl font-semibold">最近状态</h2>
          <Link href="/anime" className="chip">完整片单 →</Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {now.map((item) => {
            const card = <><span className="text-2xl" aria-hidden>{item.icon}</span><span><span className="block text-xs text-muted">{item.label}</span><span className="mt-0.5 block text-sm">{item.value}</span></span></>;
            return item.href
              ? <Link key={item.label} href={item.href} className="glass-panel glass-panel-hover flex items-center gap-3 p-4">{card}</Link>
              : <div key={item.label} className="glass-panel flex items-center gap-3 p-4">{card}</div>;
          })}
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
