"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface ChatterItem { id: number; content: string; mood: string | null; img: string | null; created_at: number }

const MOODS = ["✨", "🦋", "☕", "🌙", "🐟", "🎮", "📚", "💤"];

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60_000);
  if (m < 1) return "刚刚";
  if (m < 60) return `${m} 分钟前`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} 小时前`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d} 天前`;
  return new Date(ts).toLocaleDateString("zh-CN");
}

const TOKEN_KEY = "firefly-chatter-token";

export default function ChatterApp() {
  const [items, setItems] = useState<ChatterItem[]>([]);
  const [nextBefore, setNextBefore] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string>("");
  const [draft, setDraft] = useState("");
  const [mood, setMood] = useState<string | null>(null);
  const [posting, setPosting] = useState(false);
  const [showTokenBox, setShowTokenBox] = useState(false);
  const tokenInput = useRef<HTMLInputElement>(null);

  // 初始加载 + 恢复本地 token
  useEffect(() => {
    try {
      const t = localStorage.getItem(TOKEN_KEY);
      if (t) setToken(t);
    } catch { /* ignore */ }
    fetchItems();
  }, []);

  const fetchItems = useCallback(async (before?: number) => {
    setLoading(true);
    setError(null);
    try {
      const q = before ? `?before=${before}` : "";
      const res = await fetch(`/api/chatter${q}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setItems((prev) => before ? [...prev, ...data.items] : data.items);
      setNextBefore(data.nextBefore);
    } catch (e) {
      setError(e instanceof Error ? e.message : "加载失败");
    } finally {
      setLoading(false);
    }
  }, []);

  const saveToken = () => {
    const v = tokenInput.current?.value.trim() ?? "";
    setToken(v);
    try {
      if (v) localStorage.setItem(TOKEN_KEY, v);
    } catch { /* ignore */ }
    setShowTokenBox(false);
  };

  const clearToken = () => {
    setToken("");
    try { localStorage.removeItem(TOKEN_KEY); } catch { /* ignore */ }
  };

  const submit = async () => {
    const content = draft.trim();
    if (!content || posting) return;
    setPosting(true);
    try {
      const res = await fetch("/api/chatter", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ content, mood }),
      });
      if (res.status === 401) {
        setError("token 无效，请重新设置");
        clearToken();
        return;
      }
      if (!res.ok) {
        const d = await res.json().catch(() => null);
        throw new Error(d?.error ?? `HTTP ${res.status}`);
      }
      const item = await res.json();
      setItems((prev) => [item, ...prev]);
      setDraft("");
      setMood(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "发布失败");
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* 发布框（管理员） */}
      <div className="card p-4">
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="此刻在想什么…（需要管理员 token 才能发布）"
          rows={2}
          disabled={!token}
          className="w-full resize-none rounded-xl border border-line bg-surface2 p-3 text-sm outline-none placeholder:text-muted focus:border-accent"
        />
        <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap gap-1">
            {MOODS.map((m) => (
              <button
                key={m}
                onClick={() => setMood(mood === m ? null : m)}
                className={mood === m ? "chip !border-accent !text-accent" : "chip"}
                aria-label={`心情 ${m}`}
              >
                {m}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            {!token ? (
              <button className="chip" onClick={() => setShowTokenBox((v) => !v)}>
                🔑 管理员
              </button>
            ) : (
              <button className="chip" onClick={clearToken}>退出</button>
            )}
            <button
              className="btn-accent disabled:opacity-50"
              onClick={submit}
              disabled={!token || !draft.trim() || posting}
            >
              {posting ? "发布中…" : "发布 ✦"}
            </button>
          </div>
        </div>
        {showTokenBox && (
          <div className="mt-3 flex gap-2">
            <input
              ref={tokenInput}
              type="password"
              placeholder="输入 CHATTER_TOKEN"
              className="flex-1 rounded-xl border border-line bg-surface2 px-3 py-2 text-sm outline-none placeholder:text-muted focus:border-accent"
            />
            <button className="chip" onClick={saveToken}>保存</button>
          </div>
        )}
      </div>

      {error && (
        <p className="rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-2 text-xs text-red-400">
          {error}
        </p>
      )}

      {/* 时间线 */}
      <div className="relative space-y-4 before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-px before:bg-line">
        {items.map((it) => (
          <article key={it.id} className="card relative p-4 pl-10">
            <span className="absolute left-0 top-5 size-3.5 rounded-full bg-accent shadow-[0_0_8px_color-mix(in_srgb,var(--accent)_70%,transparent)] grid place-items-center text-[7px] text-bg">
              ✦
            </span>
            <p className="leading-snug">
              {it.mood && <span className="mr-1.5">{it.mood}</span>}
              {it.content}
            </p>
            {it.img && <img src={it.img} alt="" className="mt-2 max-h-64 rounded-xl border border-line" />}
            <time className="mt-2 block font-mono text-xs text-muted">{timeAgo(it.created_at)}</time>
          </article>
        ))}
      </div>

      {nextBefore && (
        <div className="text-center">
          <button className="chip !px-6 !py-2" onClick={() => fetchItems(nextBefore)} disabled={loading}>
            {loading ? "加载中…" : "加载更多"}
          </button>
        </div>
      )}
    </div>
  );
}