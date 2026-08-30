import type { Metadata } from "next";
import FriendForm from "@/components/friend-form";
import { getFriendLinks, getSiteInfo } from "@/lib/site";

export const metadata: Metadata = { title: "友链" };

export default function LinksPage() {
  const links = getFriendLinks();

  return (
    <div className="space-y-6 pt-8">
      <header>
        <h1 className="text-2xl font-bold">友链</h1>
        <p className="mt-1 text-sm text-muted">
          交换友链？在 <code className="rounded bg-surface2 px-1.5 py-0.5 font-mono text-xs">content/links.json</code> 中编辑即可
        </p>
      </header>
      <div className="grid gap-4 sm:grid-cols-2">
        {links.map((l) => (
          <a key={l.url} href={l.url} target="_blank" rel="noreferrer" className="card card-hover flex items-center gap-4 p-4">
            <div className="grid size-12 shrink-0 place-items-center rounded-full bg-surface2 text-xl">
              {l.avatar}
            </div>
            <div className="min-w-0">
              <p className="font-semibold">{l.name}</p>
              <p className="mt-0.5 truncate text-xs text-muted">{l.desc}</p>
            </div>
          </a>
        ))}
      </div>

      {/* 友链申请（mailto 表单，无需后端） */}
      <section className="max-w-lg">
        <h2 className="mb-3 text-lg font-semibold">申请友链</h2>
        <FriendForm email={getSiteInfo().social.email} />
      </section>
    </div>
  );
}
