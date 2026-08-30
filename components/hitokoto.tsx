"use client";

import { useEffect, useState } from "react";

interface Quote {
  text: string;
  author: string;
}

// 一言：优先请求自建 API（api.fireflyiv.com），失败时用本地兜底句（点击可换一句）
// 本地缓存 10 分钟：刷新页面不闪变、减轻 API 压力
const FALLBACK: Quote[] = [
  { text: "萤火虽微，愿为其芒。", author: "本站签名" },
  { text: "世界微尘里，吾宁爱与憎。", author: "李商隐" },
  { text: "少年与爱永不老去，即便披荆斩棘，丢失怒马鲜衣。", author: "莫峻" },
  { text: "吹灭读书灯，一身都是月。", author: "桂苓" },
];

const CACHE_KEY = "firefly-hitokoto";
const CACHE_TTL = 10 * 60 * 1000;

function readCache(): Quote | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const c = JSON.parse(raw) as Quote & { ts: number };
    if (c && c.text && Date.now() - c.ts < CACHE_TTL) {
      return { text: c.text, author: c.author };
    }
  } catch {
    /* ignore */
  }
  return null;
}

function writeCache(q: Quote) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ ...q, ts: Date.now() }));
  } catch {
    /* ignore */
  }
}

export default function Hitokoto({ className = "" }: { className?: string }) {
  const [quote, setQuote] = useState<Quote | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let alive = true;
    // 点击换句（tick>0）时跳过缓存，强制换新
    if (tick === 0) {
      const cached = readCache();
      if (cached) {
        setQuote(cached);
        return;
      }
    }
    const ac = new AbortController();
    const timer = window.setTimeout(() => ac.abort(), 5000);
    fetch("https://api.fireflyiv.com/?c=d&c=i&c=k", { signal: ac.signal })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("bad"))))
      .then((d) => {
        if (!alive || !d || !d.hitokoto) return;
        const from = d.from_who ? d.from_who + " · " + (d.from ?? "") : d.from ?? "";
        const q = { text: d.hitokoto, author: from || "佚名" };
        setQuote(q);
        writeCache(q);
      })
      .catch(() => {
        if (alive) setQuote(FALLBACK[Math.floor(Math.random() * FALLBACK.length)]);
      })
      .finally(() => window.clearTimeout(timer));
    return () => {
      alive = false;
      ac.abort();
      window.clearTimeout(timer);
    };
  }, [tick]);

  if (!quote) return null;

  return (
    <p className={"cursor-pointer select-none text-sm leading-relaxed text-muted transition-opacity hover:opacity-80 " + className}
       title="点击换一句">
      <span className="mr-1.5 text-accent" aria-hidden>✦</span>
      <span className="text-fg/90">「{quote.text}」</span>
      <span className="ml-1.5">—— {quote.author}</span>
      <button
        type="button"
        aria-label="换一句"
        onClick={() => setTick((t) => t + 1)}
        className="ml-2 text-accent/70 hover:text-accent"
      >🔄</button>
    </p>
  );
}
