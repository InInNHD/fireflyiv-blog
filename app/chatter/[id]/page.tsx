import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getChatterById } from "@/lib/db";

export const dynamic = "force-dynamic";

interface Props { params: Promise<{ id: string }> }

function findItem(rawId: string) {
  return /^\d+$/.test(rawId) ? getChatterById(Number(rawId)) : null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const item = findItem(id);
  if (!item) return { title: "碎碎念未找到" };
  const description = item.content.slice(0, 120);
  return {
    title: `碎碎念 #${item.id}`,
    description,
    alternates: { canonical: `/chatter/${item.id}` },
    openGraph: { title: `碎碎念 #${item.id}`, description, type: "article" },
  };
}

export default async function ChatterDetailPage({ params }: Props) {
  const { id } = await params;
  const item = findItem(id);
  if (!item) notFound();
  return (
    <div className="mx-auto max-w-2xl space-y-5 pt-8">
      <Link href="/chatter" className="chip">← 返回碎碎念</Link>
      <article data-lightbox className="card space-y-4 p-6">
        <p className="text-lg leading-relaxed">{item.mood && <span className="mr-2">{item.mood}</span>}{item.content}</p>
        {item.img && <img src={item.img} alt={`${item.content.slice(0, 40)} 的配图`} width={1200} height={800} decoding="async" className="h-auto max-h-[70vh] max-w-full cursor-zoom-in rounded-xl border border-line" />}
        {item.tags.length > 0 && <div className="flex flex-wrap gap-1">{item.tags.map((tag) => <span key={tag} className="chip"># {tag}</span>)}</div>}
        <time dateTime={new Date(item.created_at).toISOString()} className="block text-xs text-muted">
          {new Date(item.created_at).toLocaleString("zh-CN", { timeZone: "Asia/Shanghai" })}
        </time>
      </article>
    </div>
  );
}
