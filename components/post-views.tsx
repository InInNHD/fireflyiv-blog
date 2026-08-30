"use client";

import { useEffect, useState } from "react";

// 文章浏览量：挂载后请求 /api/views（服务端直查 Umami 数据库）
export default function PostViews({ slug }: { slug: string }) {
  const [views, setViews] = useState<number | null>(null);

  useEffect(() => {
    let alive = true;
    fetch("/api/views?slug=" + encodeURIComponent(slug))
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (alive && d && typeof d.views === "number") setViews(d.views);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [slug]);

  if (views === null) return <span>👁 统计中…</span>;
  return <span>👁 {views} 次浏览</span>;
}
