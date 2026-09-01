"use client";

export default function HomeSearchTrigger() {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event("firefly:open-search"))}
      className="glass-panel glass-panel-hover flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-muted"
      aria-label="打开站内搜索"
    >
      <span aria-hidden className="text-accent">⌕</span>
      <span className="flex-1">搜索文章标题、系列或正文…</span>
      <kbd className="chip hidden font-mono sm:inline-flex">/</kbd>
    </button>
  );
}
