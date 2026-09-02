"use client";

import { useEffect, useState } from "react";

// 返回顶部：滚动超过 600px 显示，点击平滑回顶
export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <button
      aria-label="返回顶部"
      title="返回顶部"
      onClick={() => window.scrollTo({ top: 0, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" })}
      className={
        "fixed bottom-6 right-6 z-40 grid size-11 place-items-center rounded-full border border-line bg-surface2 text-muted shadow-lg backdrop-blur transition-all hover:text-accent hover:border-accent/50 " +
        (visible ? "opacity-100" : "pointer-events-none opacity-0")
      }
    >
      ↑
    </button>
  );
}
