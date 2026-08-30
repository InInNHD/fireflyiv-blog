"use client";

import { useEffect, useState } from "react";

// 阅读进度：页面顶部一条细进度条，随滚动填充（萤光色）
export default function ReadingProgress() {
  const [pct, setPct] = useState(0);

  useEffect(() => {
    const update = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      setPct(max > 0 ? Math.min(100, Math.round((window.scrollY / max) * 100)) : 0);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-x-0 top-0 z-50 h-0.5"
    >
      <div
        className="h-full bg-accent shadow-[0_0_8px_color-mix(in_srgb,var(--accent)_70%,transparent)] transition-[width] duration-150 ease-out"
        style={{ width: pct + "%" }}
      />
    </div>
  );
}
