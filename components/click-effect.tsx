"use client";

import { useEffect } from "react";

// 点击反馈：萤火扩散光环 + 中心光点，纯 DOM 实现，零依赖
export default function ClickEffect() {
  useEffect(() => {
    let layer: HTMLDivElement | null = null;

    const onClick = (e: MouseEvent) => {
      if (!layer) {
        layer = document.createElement("div");
        layer.style.cssText = "position:fixed;inset:0;pointer-events:none;z-index:9999;";
        document.body.appendChild(layer);
      }
      const { clientX: x, clientY: y } = e;

      const ring = document.createElement("span");
      ring.style.cssText = `
        position:absolute;left:${x}px;top:${y}px;
        width:26px;height:26px;transform:translate(-50%,-50%);
        border:2px solid var(--accent);border-radius:9999px;
        box-shadow:0 0 12px color-mix(in srgb, var(--accent) 60%, transparent);
        animation:click-ring 0.55s ease-out forwards;
      `;
      layer.appendChild(ring);

      const dot = document.createElement("span");
      dot.style.cssText = `
        position:absolute;left:${x}px;top:${y}px;
        width:6px;height:6px;transform:translate(-50%,-50%);border-radius:9999px;
        background:var(--accent);
        box-shadow:0 0 8px 3px color-mix(in srgb, var(--accent) 70%, transparent);
        animation:click-dot 0.45s ease-out forwards;
      `;
      layer.appendChild(dot);

      window.setTimeout(() => {
        ring.remove();
        dot.remove();
      }, 650);
    };

    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return null;
}
