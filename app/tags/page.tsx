import type { Metadata } from "next";
import Link from "next/link";
import { getAllTags } from "@/lib/blog";

export const metadata: Metadata = { title: "标签", alternates: { canonical: "/tags" } };

export default function TagsPage() {
  const tags = getAllTags();

  return (
    <div className="space-y-6 pt-8">
      <header>
        <h1 className="text-2xl font-bold">标签</h1>
        <p className="mt-1 text-sm text-muted">共 {tags.length} 个标签</p>
      </header>
      <div className="flex flex-wrap gap-2">
        {tags.map((t) => (
          <Link key={t.slug} href={`/tags/${t.slug}`} className="chip text-sm">
            # {t.name}
            <span className="text-muted">({t.count})</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
