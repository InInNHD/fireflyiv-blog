import { unified } from "unified";
import type { Plugin } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeSlug from "rehype-slug";
import rehypeStringify from "rehype-stringify";
import rehypeShiki from "./rehype-shiki";

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
    .use(remarkRehype)
    .use(dropRawHtml)
    .use(rehypeSlug)
    .use(rehypeShiki)
    .use(rehypeStringify)
    .process(content);
  return String(file);
}
