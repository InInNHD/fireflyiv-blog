import type { Metadata } from "next";
import Link from "next/link";
import { getAllSeries } from "@/lib/blog";

export const metadata: Metadata = { title: "系列", alternates: { canonical: "/series" } };

export default function SeriesPage() {
  const series = getAllSeries();
  return (
    <div className="space-y-6 pt-8">
      <header><h1 className="text-2xl font-bold">文章系列</h1><p className="mt-1 text-sm text-muted">连续阅读同一主题</p></header>
      <div className="flex flex-wrap gap-2">
        {series.map((item) => (
          <Link key={item.slug} href={`/series/${item.slug}`} className="chip text-sm">📚 {item.name} ({item.count})</Link>
        ))}
      </div>
    </div>
  );
}
