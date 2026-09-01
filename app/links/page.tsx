import type { Metadata } from "next";
import FriendForm from "@/components/friend-form";
import { getFriendLinks, getSiteInfo } from "@/lib/site";

export const metadata: Metadata = { title: "友链", alternates: { canonical: "/links" } };

export default function LinksPage() {
  const links = getFriendLinks();

  return (
    <div className="space-y-7 pt-8">
      <header className="glass-panel glass-feature p-7 sm:p-9">
        <p className="text-xs uppercase tracking-[0.26em] text-accent">Firefly network</p>
        <h1 className="mt-2 text-3xl font-bold">萤火相连</h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
          那些散落在网络星河里的有趣站点。每一束微光，都通向一个真实而独特的世界。
        </p>
      </header>
      <div className="grid gap-4 sm:grid-cols-2">
        {links.map((l) => (
          <a key={l.url} href={l.url} target="_blank" rel="noreferrer" className="glass-panel glass-panel-hover group flex items-center gap-4 p-5">
            <div className="link-avatar grid size-14 shrink-0 place-items-center rounded-2xl text-2xl">
              {l.avatar}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2"><p className="truncate font-semibold">{l.name}</p><span className="size-1.5 shrink-0 rounded-full bg-accent shadow-[0_0_8px_var(--accent)]" aria-label="可访问" /></div>
              <p className="mt-0.5 truncate text-xs text-muted">{l.desc}</p>
            </div>
            <span className="text-muted transition-transform group-hover:translate-x-1 group-hover:text-accent" aria-hidden>↗</span>
          </a>
        ))}
      </div>

      {/* 友链申请（mailto 表单，无需后端） */}
      <section className="max-w-lg">
        <h2 className="mb-3 text-lg font-semibold">申请友链</h2>
        <FriendForm email={getSiteInfo().social.email} turnstileSiteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY} />
      </section>
    </div>
  );
}
