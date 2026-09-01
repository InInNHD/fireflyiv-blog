"use client";

import { useState } from "react";
import Script from "next/script";

// 友链申请：POST 到 /api/friend-request（入库 + 邮件通知站长）
export default function FriendForm({ email, turnstileSiteKey }: { email?: string; turnstileSiteKey?: string }) {
  const [form, setForm] = useState({ name: "", url: "", avatar: "", desc: "" });
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (state === "sending") return;
    setState("sending");
    setError("");
    const turnstileToken = String(new FormData(e.currentTarget as HTMLFormElement).get("cf-turnstile-response") ?? "");
    try {
      const res = await fetch("/api/friend-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, turnstileToken }),
      });
      const d = await res.json().catch(() => null);
      if (!res.ok || !d?.ok) {
        setError(d?.error ?? "提交失败，请稍后再试");
        setState("error");
        (window as any).turnstile?.reset();
        return;
      }
      setState("done");
    } catch {
      setError("网络异常，也可以直接邮件联系：" + (email ?? ""));
      setState("error");
      (window as any).turnstile?.reset();
    }
  };

  const set =
    (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  if (state === "done") {
    return (
      <div className="glass-panel p-5 text-center">
        <p className="text-lg">✨</p>
        <p className="mt-2 text-sm text-fg">申请已提交！</p>
        <p className="mt-1 text-xs text-muted">我会尽快查看并添加，感谢互换友链。</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="glass-panel space-y-3 p-5">
      <p className="text-sm leading-relaxed text-muted">
        想交换友链？填好下面的信息提交，我会尽快审核添加。
      </p>
      <label className="block">
        <span className="mb-1 block text-xs text-muted">站点名 *</span>
        <input
          required
          value={form.name}
          onChange={set("name")}
          placeholder="你的博客名字"
          className="w-full rounded-xl border border-line bg-surface2 px-3 py-2 text-sm outline-none placeholder:text-muted focus:border-accent"
        />
      </label>
      <label className="block">
        <span className="mb-1 block text-xs text-muted">URL *</span>
        <input
          required
          type="url"
          value={form.url}
          onChange={set("url")}
          placeholder="https://example.com"
          className="w-full rounded-xl border border-line bg-surface2 px-3 py-2 text-sm outline-none placeholder:text-muted focus:border-accent"
        />
      </label>
      <label className="block">
        <span className="mb-1 block text-xs text-muted">头像（可选）</span>
        <input
          value={form.avatar}
          onChange={set("avatar")}
          placeholder="头像图片地址或 emoji"
          className="w-full rounded-xl border border-line bg-surface2 px-3 py-2 text-sm outline-none placeholder:text-muted focus:border-accent"
        />
      </label>
      <label className="block">
        <span className="mb-1 block text-xs text-muted">一句话简介（可选）</span>
        <input
          value={form.desc}
          onChange={set("desc")}
          placeholder="用一句话介绍你的站点"
          className="w-full rounded-xl border border-line bg-surface2 px-3 py-2 text-sm outline-none placeholder:text-muted focus:border-accent"
        />
      </label>
      <button type="submit" disabled={state === "sending"} className="btn-accent disabled:opacity-40">
        {state === "sending" ? "提交中…" : "✉️ 提交申请"}
      </button>
      {turnstileSiteKey && (
        <>
          <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" strategy="lazyOnload" />
          <div className="cf-turnstile" data-sitekey={turnstileSiteKey} data-theme="auto" />
        </>
      )}
      {error && <p className="text-xs text-red-400">{error}</p>}
    </form>
  );
}
