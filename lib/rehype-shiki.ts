import { codeToHast } from "shiki";

// 给 <pre><code class="language-xx"> 做语法高亮（shiki）。
// 亮/暗双主题通过 CSS 变量切换：defaultColor: "light"，
// 暗色模式在 globals.css 用 html:not(.light) 覆盖 --shiki-dark。
interface PreJob {
  pre: any;
  parent: any;
  index: number;
}

export default function rehypeShiki() {
  return async (tree: any) => {
    const jobs: PreJob[] = [];
    collect(tree, jobs);
    if (!jobs.length) return;

    await Promise.all(
      jobs.map(async ({ pre, parent, index }) => {
        const codeEl = pre.children.find((c: any) => c?.tagName === "code");
        if (!codeEl) return;
        const lang = getLang(codeEl);
        const text = textOf(codeEl);
        if (!text.trim()) return;

        try {
          const hast = await codeToHast(text, {
            lang: lang || "text",
            themes: { light: "github-light", dark: "github-dark" },
            defaultColor: "light",
          });
          const rendered = hast.children[0] as any;
          if (!rendered || rendered.type !== "element") return;
          // 合并语言类名（shiki 4 输出的是 class 字符串属性）
          const props = rendered.properties ?? {};
          const classes = String(props.class ?? "")
            .split(/\s+/)
            .filter(Boolean);
          if (lang && !classes.includes("language-" + lang)) classes.push("language-" + lang);
          delete props.className;
          rendered.properties = { ...props, class: classes.join(" ") };
          parent.children[index] = rendered;
        } catch {
          // 未知语言等异常：保留原始 <pre>，走默认样式
        }
      })
    );
  };
}

function collect(node: any, jobs: PreJob[]): void {
  if (!node || typeof node !== "object") return;
  if (!Array.isArray(node.children)) return;
  node.children.forEach((c: any, i: number) => {
    if (c?.type === "element" && c.tagName === "pre" && Array.isArray(c.children)) {
      jobs.push({ pre: c, parent: node, index: i });
    } else {
      collect(c, jobs);
    }
  });
}

function getLang(codeEl: any): string {
  const cls = codeEl.properties?.className;
  const list = Array.isArray(cls) ? cls : cls ? [cls] : [];
  for (const c of list) {
    if (typeof c === "string" && c.startsWith("language-")) {
      const lang = c.slice(9).toLowerCase();
      return lang || "";
    }
  }
  return "";
}

function textOf(codeEl: any): string {
  const parts: string[] = [];
  collectText(codeEl, parts);
  return parts.join("");
}

function collectText(node: any, parts: string[]): void {
  if (!node) return;
  if (node.type === "text" || node.type === "raw") {
    parts.push(String(node.value ?? ""));
    return;
  }
  if (Array.isArray(node.children)) for (const c of node.children) collectText(c, parts);
}
