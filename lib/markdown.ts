import { unified } from "unified";
import type { Plugin } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeSlug from "rehype-slug";
import rehypeStringify from "rehype-stringify";
import rehypeShiki from "./rehype-shiki";

const CALLOUTS: Record<string, string> = {
  NOTE: "备注",
  TIP: "提示",
  IMPORTANT: "重要",
  WARNING: "警告",
  CAUTION: "注意",
};

// 支持 GitHub 风格的 > [!NOTE] / [!TIP] / [!WARNING] 提示块。
const remarkCallouts: Plugin = () => (tree: any) => {
  const walk = (node: any): void => {
    if (!node || !Array.isArray(node.children)) return;
    for (const child of node.children) {
      if (child.type === "blockquote") {
        const text = child.children?.[0]?.children?.[0];
        const match = text?.type === "text" ? text.value.match(/^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*/i) : null;
        if (match) {
          const type = match[1].toUpperCase();
          text.value = text.value.slice(match[0].length);
          child.data = {
            hName: "aside",
            hProperties: { className: ["callout", `callout-${type.toLowerCase()}`], dataLabel: CALLOUTS[type] },
          };
        }
      }
      walk(child);
    }
  };
  walk(tree);
};

// 与 react-markdown 的默认行为一致：忽略 markdown 中内嵌的原始 HTML（不渲染，防 XSS）
const dropRawHtml: Plugin = () => (tree: any) => {
  const drop = (node: any): void => {
    if (!node || !Array.isArray(node.children)) return;
    node.children = node.children.filter(
      (c: any) => c.type !== "html" && c.type !== "raw"
    );
    node.children.forEach(drop);
  };
  drop(tree);
};

// 构建期将 Markdown 渲染为高亮后的 HTML 字符串（unified 流水线，支持异步 shiki 插件）
export async function renderMarkdown(content: string): Promise<string> {
  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkCallouts)
    .use(remarkRehype)
    .use(dropRawHtml)
    .use(rehypeSlug)
    .use(rehypeShiki)
    .use(rehypeStringify)
    .process(content);
  return String(file);
}
