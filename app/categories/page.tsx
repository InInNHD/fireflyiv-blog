import type { Metadata } from "next";
import Link from "next/link";
import { getAllCategories } from "@/lib/blog";

export const metadata: Metadata = { title: "分类", alternates: { canonical: "/categories" } };

export default function CategoriesPage() {
  const categories = getAllCategories();
  return (
    <div className="space-y-6 pt-8">
      <header><h1 className="text-2xl font-bold">分类</h1><p className="mt-1 text-sm text-muted">按主题浏览文章</p></header>
      <div className="flex flex-wrap gap-2">
        {categories.map((item) => (
          <Link key={item.slug} href={`/categories/${item.slug}`} className="chip text-sm">📂 {item.name} ({item.count})</Link>
        ))}
      </div>
    </div>
  );
}
