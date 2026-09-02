import type { Metadata } from "next";
import Link from "next/link";
import { getArchive } from "@/lib/blog";

export const metadata: Metadata = { title: "归档", alternates: { canonical: "/archive" } };

export default function ArchivePage() {
  const archive = getArchive();
  const total = archive.reduce((n, y) => n + y.months.reduce((m, mo) => m + mo.posts.length, 0), 0);

  return (
    <div className="space-y-8 pt-8">
      <header>
        <h1 className="text-2xl font-bold">归档</h1>
        <p className="mt-1 text-sm text-muted">共 {total} 篇文章</p>
      </header>
      {archive.map((y) => (
        <section key={y.year} className="space-y-4">
          <h2 className="text-xl font-semibold text-accent">{y.year}</h2>
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 lg:grid-cols-12" aria-label={`${y.year} 年月度文章活跃度`}>
            {Array.from({ length: 12 }, (_, index) => {
              const month = String(index + 1).padStart(2, "0");
              const count = y.months.find((item) => item.month === month)?.posts.length ?? 0;
              const cell = (
                <>
                  <span className="text-xs text-muted">{index + 1} 月</span>
                  <strong className="mt-1 block text-lg">{count}</strong>
                </>
              );
              return count ? (
                <a key={month} href={`#archive-${y.year}-${month}`} className="rounded-xl border border-line p-2 text-center transition-colors hover:border-accent" style={{ background: `color-mix(in srgb, var(--accent) ${Math.min(12 + count * 12, 52)}%, var(--surface))` }} aria-label={`${y.year} 年 ${index + 1} 月，${count} 篇文章`}>
                  {cell}
                </a>
              ) : (
                <div key={month} className="rounded-xl border border-line bg-surface p-2 text-center opacity-55" aria-label={`${y.year} 年 ${index + 1} 月，无文章`}>
                  {cell}
                </div>
              );
            })}
          </div>
          <div className="mt-3 space-y-3 border-l-2 border-line pl-5">
            {y.months.map((mo) => (
              <div key={mo.month} id={`archive-${y.year}-${mo.month}`} className="scroll-mt-24">
                <p className="mb-1 text-xs font-medium text-muted">{Number(mo.month)} 月</p>
                <ul className="space-y-1">
                  {mo.posts.map((p) => (
                    <li key={p.slug} className="flex items-baseline gap-3 text-sm">
                      <span className="shrink-0 font-mono text-xs text-muted">{p.date}</span>
                      <Link href={`/posts/${p.slug}`} className="transition-colors hover:text-accent">
                        {p.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
