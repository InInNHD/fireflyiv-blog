import type { Metadata } from "next";
import { getSiteInfo } from "@/lib/site";

export const metadata: Metadata = {
  title: "关于",
  description: "关于 FireflyIv 与这座自托管的萤火小站。",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  const site = getSiteInfo();

  return (
    <div className="mx-auto max-w-2xl space-y-6 pt-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold">关于</h1>
      </header>
      <section className="card space-y-4 p-6 leading-relaxed">
        <p>
          你好，这里是 <span className="text-accent font-semibold">{site.name}</span>。
          一个用 <code className="rounded bg-surface2 px-1.5 py-0.5 font-mono text-xs">Next.js 16 + React 19 + Tailwind CSS v4</code> 搭建的
          个人博客，部署在我自己的腾讯云服务器上，经 Cloudflare Tunnel 穿透出网。
        </p>
        <p>
          灵感来源于 XinghuisamaBlogs 这类「Next.js 高颜值博客」项目：卡片流、碎碎念、移动端优先。
          这个站点刻意保持简单——文章用 Markdown 写在仓库里，碎碎念和评论自托管，数据永远在自己手里。
        </p>
        <div className="grid gap-2 rounded-xl bg-surface2 p-4 text-sm">
          <p>📮 邮箱：{site.social.email ?? "（未配置）"}</p>
          <p>📍 服务器：腾讯云 · 4 核 4G</p>
          <p>🔗 隧道：Cloudflare Tunnel（cloudflared）</p>
        </div>
      </section>
    </div>
  );
}
