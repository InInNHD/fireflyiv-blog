"use client";

import { useEffect } from "react";

// 鼠标拖尾：光标移动时撒出渐隐的萤光光点，纯 DOM 实现，零依赖
export default function MouseTrail() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let layer: HTMLDivElement | null = null;
    let last = 0;
    let alive = 0;

    const add = (x: number, y: number) => {
      if (alive >= 26) return; // 控制光点数量上限
      if (!layer) {
        layer = document.createElement("div");
        layer.style.cssText = "position:fixed;inset:0;pointer-events:none;z-index:9997;";
        document.body.appendChild(layer);
      }
      const accent = getComputedStyle(document.documentElement).getPropertyValue("--accent").trim();
      const accent2 = getComputedStyle(document.documentElement).getPropertyValue("--accent2").trim();
      const colors = [accent, accent2];
      const size = 3 + Math.random() * 3;
      const dot = document.createElement("span");
      dot.className = "trail-dot";
      const color = colors[Math.floor(Math.random() * colors.length)] || "var(--accent)";
      dot.style.cssText = `left:${x}px;top:${y}px;width:${size}px;height:${size}px;background:${color};box-shadow:0 0 6px 2px ${color};`;
      layer.appendChild(dot);
      alive++;
      dot.addEventListener("animationend", () => {
        dot.remove();
        alive--;
      });
    };

    const onMove = (e: MouseEvent) => {
      const now = performance.now();
      if (now - last < 55) return; // 节流 ~18 个/秒
      last = now;
      // 轻微随机偏移，制造自然的"萤火散落"感
      add(e.clientX + (Math.random() * 16 - 8), e.clientY + (Math.random() * 16 - 8));
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMove);
      layer?.remove();
    };
  }, []);

  return null;
}
