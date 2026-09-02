import type { Metadata } from "next";
import { getAnimeData, type AnimeStatus } from "@/lib/site";

export function generateMetadata(): Metadata {
  return { title: "追番", description: "FireflyIv 的动画观看记录", alternates: { canonical: "/anime" }, robots: getAnimeData().items.length ? undefined : { index: false, follow: true } };
}

const STATUS: Record<AnimeStatus, { label: string; icon: string }> = {
  watching: { label: "正在看", icon: "📺" },
  completed: { label: "已看完", icon: "✅" },
  planned: { label: "想看", icon: "🌱" },
  paused: { label: "暂缓", icon: "⏸️" },
};

export default function AnimePage() {
  const data = getAnimeData();
  return (
    <div className="space-y-7 pt-8">
      <header><h1 className="text-2xl font-bold">追番记录</h1><p className="mt-1 text-sm text-muted">{data.intro}</p></header>
      {data.items.length === 0 ? (
        <div className="card p-8 text-center text-muted">片单还在整理中，稍后再来看看 🌱</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {data.items.map((item) => {
            const content = (
              <article className="card card-hover flex h-full overflow-hidden">
                {item.cover ? (
                  <img src={item.cover} alt={`${item.title} 封面`} width={256} height={384} loading="lazy" decoding="async" className="w-28 shrink-0 object-cover sm:w-32" />
                ) : (
                  <div className="grid w-28 shrink-0 place-items-center bg-surface2 text-3xl sm:w-32">{STATUS[item.status].icon}</div>
                )}
                <div className="min-w-0 space-y-2 p-4">
                  <span className="chip">{STATUS[item.status].icon} {STATUS[item.status].label}</span>
                  <h2 className="font-semibold">{item.title}</h2>
                  <p className="text-xs text-muted">{item.progress || "进度未记录"}{item.rating ? ` · ${item.rating}/10` : ""}</p>
                  {item.comment && <p className="line-clamp-3 text-sm text-muted">{item.comment}</p>}
                </div>
              </article>
            );
            return item.url ? <a key={item.title} href={item.url} target="_blank" rel="noreferrer">{content}</a> : <div key={item.title}>{content}</div>;
          })}
        </div>
      )}
    </div>
  );
}
