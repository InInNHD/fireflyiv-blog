"use client";

import { useState } from "react";

export default function PostShare({ title }: { title: string }) {
  const [message, setMessage] = useState("分享文章");

  const share = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title, url: window.location.href });
        setMessage("已分享");
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setMessage("链接已复制");
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setMessage("分享失败");
    }
    window.setTimeout(() => setMessage("分享文章"), 1800);
  };

  return <button type="button" onClick={share} className="chip" aria-live="polite">↗ {message}</button>;
}
