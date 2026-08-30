import type { Metadata } from "next";
import Link from "next/link";
import { getArchive } from "@/lib/blog";

export const metadata: Metadata = { title: "归档" };

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
        <section key={y.year}>
          <h2 className="text-xl font-semibold text-accent">{y.year}</h2>
          <div className="mt-3 space-y-3 border-l-2 border-line pl-5">
            {y.months.map((mo) => (
              <div key={mo.month}>
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
