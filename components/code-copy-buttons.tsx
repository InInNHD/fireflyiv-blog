"use client";

import { useEffect } from "react";

export default function CodeCopyButtons() {
  useEffect(() => {
    const blocks = document.querySelectorAll<HTMLElement>(".markdown-body pre");
    for (const block of blocks) {
      if (block.querySelector(".code-copy")) continue;
      const button = document.createElement("button");
      button.type = "button";
      button.className = "code-copy";
      button.textContent = "复制";
      button.setAttribute("aria-label", "复制代码");
      button.addEventListener("click", async () => {
        const code = block.querySelector("code")?.textContent ?? block.textContent ?? "";
        try {
          await navigator.clipboard.writeText(code);
          button.textContent = "已复制";
        } catch {
          button.textContent = "复制失败";
        }
        window.setTimeout(() => { button.textContent = "复制"; }, 1500);
      });
      block.appendChild(button);
    }
  }, []);

  return null;
}
