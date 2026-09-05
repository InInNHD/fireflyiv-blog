"use client";

import { useEffect, useRef } from "react";
import "artalk/dist/Artalk.css";

export default function ArtalkComments({
  pageKey,
  pageTitle,
}: {
  pageKey: string;
  pageTitle: string;
}) {
  const elRef = useRef<HTMLDivElement>(null);
  const server = process.env.NEXT_PUBLIC_ARTALK_SERVER;

  useEffect(() => {
    if (!server || !elRef.current) return;
    const el = elRef.current;
    let disposed = false;
    let artalk: { destroy: () => void } | null = null;
    let io: IntersectionObserver | null = null;

    const load = () => {
      if (disposed) return;
      import("artalk").then(({ default: Artalk }) => {
        if (disposed || !elRef.current) return;
        artalk = Artalk.init({
          el: elRef.current,
          server,
          site: "fireflyiv",
          pageKey,
          pageTitle,
        });
      });
    };

    // 懒加载：滚动到评论区附近（提前 300px）才开始初始化，减少首屏开销
    if (typeof IntersectionObserver !== "undefined") {
      io = new IntersectionObserver(
        (entries) => {
          if (entries.some((e) => e.isIntersecting)) {
            io?.disconnect();
            load();
          }
        },
        { rootMargin: "300px 0px" }
      );
      io.observe(el);
    } else {
      load();
    }

    return () => {
      disposed = true;
      io?.disconnect();
      artalk?.destroy();
    };
  }, [server, pageKey, pageTitle]);

  if (!server) {
    return (
      <div className="card p-5 text-center text-sm text-muted">
        评论区未启用（配置 NEXT_PUBLIC_ARTALK_SERVER 后开启）
      </div>
    );
  }

  return <div ref={elRef} className="mt-10" />;
}
