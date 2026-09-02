"use client";

import { useEffect, useState } from "react";

interface TocItem {
  id: string;
  text: string;
  level: number;
}

// 文章目录：从 .markdown-body 的 h1~h3（rehype-slug 已生成 id）扫描生成，
// 滚动监听高亮当前章节；标题不足 2 个时不渲染。
export default function PostToc({ collapsible = false }: { collapsible?: boolean }) {
  const [items, setItems] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const root = document.querySelector(".markdown-body");
    if (!root) return;

    const headings = Array.from(root.querySelectorAll("h1, h2, h3"))
      .map((h) => ({
        id: h.id,
        text: (h.textContent ?? "").trim().replace(/\s+/g, " "),
        level: Number(h.tagName.charAt(1)),
      }))
      .filter((h) => h.id && h.text);
    if (headings.length < 2) return;
    setItems(headings);

    const pick = () => {
      let current = headings[0].id;
      for (const h of headings) {
        const el = document.getElementById(h.id);
        if (el && el.getBoundingClientRect().top <= 90) current = h.id;
        else break;
      }
      setActiveId(current);
    };
    pick();
    window.addEventListener("scroll", pick, { passive: true });
    window.addEventListener("resize", pick);
    return () => {
      window.removeEventListener("scroll", pick);
      window.removeEventListener("resize", pick);
    };
  }, []);

  if (items.length === 0) return null;

  const links = (
      <ul className={collapsible ? "mt-2 space-y-0.5" : "space-y-0.5"}>
        {items.map((h) => (
          <li key={h.id} style={{ paddingLeft: `${(h.level - 1) * 0.75}rem` }}>
            <a
              href={`#${h.id}`}
              onClick={(e) => {
                e.preventDefault();
                document.getElementById(h.id)?.scrollIntoView({ behavior: "smooth", block: "start" });
                history.replaceState(null, "", `#${h.id}`);
              }}
              className={
                "block truncate rounded-lg px-2 py-1 text-[13px] leading-snug transition-colors " +
                (activeId === h.id
                  ? "border-l-2 border-accent bg-surface2 text-accent"
                  : "border-l-2 border-transparent text-muted hover:bg-surface2 hover:text-fg")
              }
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>
  );

  if (collapsible) {
    return (
      <details className="rounded-2xl border border-line bg-surface p-4">
        <summary className="cursor-pointer text-sm font-semibold text-accent">📑 本文目录</summary>
        <nav aria-label="文章目录">{links}</nav>
      </details>
    );
  }

  return (
    <nav className="rounded-2xl border border-line bg-surface p-4" aria-label="文章目录">
      <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold"><span className="text-accent">📑</span> 目录</p>
      {links}
    </nav>
  );
}
