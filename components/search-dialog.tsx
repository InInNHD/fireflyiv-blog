"use client";
import { useCallback, useEffect, useRef, useState } from "react";

interface SearchPost {
  slug: string;
  title: string;
  description: string;
  date: string;
  tags: { name: string; slug: string }[];
  category?: { name: string; slug: string };
  series?: { name: string; slug: string };
  content: string;
}

interface Hit {
  post: SearchPost;
  score: number;
  snippet: string;
}

// 站内搜索：按 / 或点击导航按钮打开；索引构建时静态生成在 /search-index.json
export default function SearchDialog() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState<SearchPost[] | null>(null);
  const [hits, setHits] = useState<Hit[]>([]);
  const [loaded, setLoaded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const openDialog = useCallback(async () => {
    openerRef.current = document.activeElement as HTMLElement | null;
    setOpen(true);
    if (!index && !loaded) {
      try {
        abortRef.current?.abort();
        const ac = new AbortController();
        abortRef.current = ac;
        const res = await fetch("/search-index.json", { signal: ac.signal });
        if (!res.ok) throw new Error("HTTP " + res.status);
        const data = await res.json();
        setIndex(data.posts ?? []);
      } catch {
        setIndex([]);
      } finally {
        setLoaded(true);
      }
    }
  }, [index, loaded]);

  const closeDialog = useCallback(() => {
    setOpen(false);
    setQuery("");
    window.setTimeout(() => openerRef.current?.focus(), 0);
  }, []);

  // 快捷键：/ 打开（输入框聚焦时除外），Esc 关闭
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "/" && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const t = e.target as HTMLElement | null;
        if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
        e.preventDefault();
        openDialog();
      } else if (e.key === "Escape") {
        closeDialog();
      }
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("firefly:open-search", openDialog);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("firefly:open-search", openDialog);
    };
  }, [openDialog, closeDialog]);

  useEffect(() => {
    if (open) {
      const t = window.setTimeout(() => inputRef.current?.focus(), 40);
      const trapFocus = (e: KeyboardEvent) => {
        if (e.key !== "Tab" || !dialogRef.current) return;
        const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
        );
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      };
      document.addEventListener("keydown", trapFocus);
      return () => {
        window.clearTimeout(t);
        document.removeEventListener("keydown", trapFocus);
      };
    }
  }, [open]);

  // 检索：分词 + 多字段加权，全部词命中才算
  useEffect(() => {
    if (!open || !index) {
      setHits([]);
      return;
    }
    const q = query.trim().toLowerCase();
    if (!q) {
      setHits([]);
      return;
    }
    const terms = q.split(/\s+/).map((s) => s.trim()).filter(Boolean);
    if (!terms.length) {
      setHits([]);
      return;
    }
    const out: Hit[] = [];
    for (const p of index) {
      const title = p.title.toLowerCase();
      const desc = p.description.toLowerCase();
      const tags = p.tags.map((t) => t.name.toLowerCase()).join(" ");
      const groups = `${p.category?.name ?? ""} ${p.series?.name ?? ""}`.toLowerCase();
      const content = p.content.toLowerCase();
      let score = 0;
      let ok = true;
      for (const term of terms) {
        if (title.includes(term)) score += 8;
        else if (groups.includes(term)) score += 6;
        else if (tags.includes(term)) score += 5;
        else if (desc.includes(term)) score += 3;
        else if (content.includes(term)) score += 1;
        else { ok = false; break; }
      }
      if (!ok) continue;
      const ci = content.indexOf(terms[0]);
      const snippet =
        ci >= 0
          ? (ci > 30 ? "…" : "") + p.content.slice(Math.max(0, ci - 30), ci + 70).replace(/\s+/g, " ") + (ci + 70 < p.content.length ? "…" : "")
          : p.description;
      out.push({ post: p, score, snippet });
    }
    out.sort((a, b) => b.score - a.score);
    setHits(out.slice(0, 8));
  }, [query, open, index]);

  return (
    <>
      <button
        onClick={openDialog}
        aria-label="搜索文章"
        title="搜索（/）"
        className="chip cursor-pointer select-none"
      >
        <span aria-hidden>🔍</span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[9990] flex items-start justify-center bg-black/60 p-4 pt-[12vh] backdrop-blur-sm"
          onClick={closeDialog}
        >
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-label="站内搜索"
            className="card w-full max-w-xl overflow-hidden !bg-surface/90 p-0"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center border-b border-line pr-2">
              <label className="flex flex-1 items-center gap-2 px-4 py-3">
                <span aria-hidden className="text-accent">✦</span>
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="搜索文章标题 / 分类 / 内容…"
                  className="w-full bg-transparent text-sm outline-none placeholder:text-muted"
                />
              </label>
              <button type="button" onClick={closeDialog} aria-label="关闭搜索" className="chip size-8 justify-center !p-0 text-base">×</button>
            </div>
            <div className="max-h-[55vh] overflow-y-auto p-2">
              {!query.trim() ? (
                <p className="px-3 py-6 text-center text-sm text-muted">输入关键词，全站全文搜索</p>
              ) : hits.length === 0 ? (
                <p className="px-3 py-6 text-center text-sm text-muted">没有找到相关文章 🫥</p>
              ) : (
                hits.map((h) => (
                  <a
                    key={h.post.slug}
                    href={"/posts/" + h.post.slug}
                    onClick={closeDialog}
                    className="block rounded-xl px-3 py-2.5 transition-colors hover:bg-surface2"
                  >
                    <p className="flex items-baseline justify-between gap-2">
                      <span className="truncate text-sm font-medium hover:text-accent">{h.post.title}</span>
                      <time className="shrink-0 font-mono text-[11px] text-muted">{h.post.date}</time>
                    </p>
                    {h.snippet && (
                      <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-muted">{h.snippet}</p>
                    )}
                    {h.post.tags.length > 0 && (
                      <p className="mt-1 flex flex-wrap gap-1">
                        {h.post.tags.slice(0, 3).map((t) => (
                          <span key={t.slug} className="rounded-full border border-line px-1.5 py-px text-[10px] text-muted">#{t.name}</span>
                        ))}
                      </p>
                    )}
                  </a>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
