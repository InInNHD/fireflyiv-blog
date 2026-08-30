"use client";

import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [light, setLight] = useState(false);

  useEffect(() => {
    setLight(document.documentElement.classList.contains("light"));
  }, []);

  const toggle = () => {
    const next = !light;
    setLight(next);
    document.documentElement.classList.toggle("light", next);
    try {
      localStorage.setItem("firefly-theme", next ? "light" : "dark");
    } catch {
      /* ignore */
    }
  };

  return (
    <button
      onClick={toggle}
      aria-label={light ? "切换到暗色" : "切换到亮色"}
      className="chip cursor-pointer select-none"
      title={light ? "暗色模式" : "亮色模式"}
    >
      <span aria-hidden>{light ? "☀️" : "🌙"}</span>
    </button>
  );
}
