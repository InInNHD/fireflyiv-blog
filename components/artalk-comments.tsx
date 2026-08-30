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
    let disposed = false;
    let artalk: { destroy: () => void } | null = null;

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

    return () => {
      disposed = true;
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