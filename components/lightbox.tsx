"use client";

import { useEffect } from "react";

// 文章图片灯箱：点击 .markdown-body 内的图片全屏放大，Esc / 点击遮罩关闭
export default function ImageLightbox() {
  useEffect(() => {
    let overlay: HTMLDivElement | null = null;

    const close = () => {
      overlay?.remove();
      overlay = null;
      document.body.style.overflow = "";
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };

    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target || target.tagName !== "IMG") return;
      const img = target as HTMLImageElement;
      if (!img.closest(".markdown-body")) return;
      e.preventDefault();
      close();

      overlay = document.createElement("div");
      overlay.className = "lb-overlay";
      overlay.style.cssText =
        "position:fixed;inset:0;z-index:9998;background:rgba(2,6,18,0.85);" +
        "backdrop-filter:blur(4px);display:grid;place-items:center;cursor:zoom-out;" +
        "padding:2rem;";
      overlay.addEventListener("click", (ev) => {
        ev.stopPropagation();
        close();
      });

      const big = document.createElement("img");
      big.src = img.currentSrc || img.src;
      big.alt = img.alt || "";
      big.className = "lb-img";
      big.style.cssText =
        "max-width:92vw;max-height:84vh;border-radius:0.9rem;" +
        "border:1px solid var(--line);box-shadow:0 24px 80px rgba(0,0,0,0.55);";
      overlay.appendChild(big);

      if (big.alt) {
        const cap = document.createElement("p");
        cap.textContent = big.alt;
        cap.style.cssText =
          "margin-top:0.9rem;max-width:80vw;text-align:center;color:var(--muted);font-size:0.85rem;";
        overlay.appendChild(cap);
      }

      document.body.appendChild(overlay);
      document.body.style.overflow = "hidden";
    };

    document.addEventListener("click", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("click", onClick);
      document.removeEventListener("keydown", onKey);
      close();
    };
  }, []);

  return null;
}
