import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "项目与服务",
  description: "FireflyIv 的个人项目与自托管服务矩阵。",
  alternates: { canonical: "/projects" },
};

const PROJECTS = [
  { name: "FireflyIv Blog", icon: "✦", description: "Next.js 驱动的个人博客，文章、搜索、评论和内容数据均由自己维护。", tags: ["Next.js", "Markdown", "Docker"], href: "https://www.fireflyiv.com", source: "https://github.com/InInNHD/fireflyiv-blog" },
  { name: "服务状态", icon: "◉", description: "覆盖全部公网入口的内容探针、实时心跳和故障历史。", tags: ["Uptime Kuma", "Monitoring"], href: "https://status.fireflyiv.com" },
  { name: "FireflyIv 导航", icon: "⌘", description: "汇总主站、内容服务、监控工具和常用入口的导航面板。", tags: ["Dashy", "Docker"], href: "https://nav.fireflyiv.com" },
  { name: "一言 API", icon: "❝", description: "自托管句子库与 Redis 缓存，为主站提供随机一言。", tags: ["API", "Redis"], href: "https://api.fireflyiv.com" },
  { name: "PrivateBin", icon: "⌁", description: "浏览器端加密的临时文本分享服务，服务器不读取明文。", tags: ["Privacy", "Self-hosted"], href: "https://paste.fireflyiv.com" },
  { name: "Memos", icon: "▤", description: "轻量、自托管的个人笔记与备忘服务。", tags: ["Notes", "Self-hosted"], href: "https://note.fireflyiv.com" },
  { name: "图片服务", icon: "▧", description: "用于博客图片与个人素材管理的自托管图床。", tags: ["Lsky Pro", "Storage"], href: "https://i.fireflyiv.com" },
  { name: "Artalk 评论", icon: "☵", description: "主站文章使用的自托管评论系统，数据保留在自己的服务器。", tags: ["Comments", "SQLite"], href: "https://talk.fireflyiv.com" },
];

export default function ProjectsPage() {
  return (
    <div className="space-y-7 pt-8">
      <header className="max-w-2xl">
        <p className="text-xs uppercase tracking-[0.22em] text-accent">Projects Matrix</p>
        <h1 className="mt-2 text-2xl font-bold">项目与服务</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted">这里展示正在维护的主站和公开自托管服务。运行状态以状态页为准，管理入口仍受访问策略保护。</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {PROJECTS.map((project) => (
          <article key={project.name} className="glass-panel glass-panel-hover flex min-h-56 flex-col p-5">
            <div className="grid size-11 place-items-center rounded-xl border border-line bg-surface2 text-xl text-accent">{project.icon}</div>
            <h2 className="mt-4 text-lg font-semibold">{project.name}</h2>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">{project.description}</p>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {project.tags.map((tag) => <span key={tag} className="chip">{tag}</span>)}
            </div>
            <div className="mt-4 flex items-center gap-3 text-sm">
              <a href={project.href} target="_blank" rel="noreferrer" className="text-accent hover:underline">访问服务 ↗</a>
              {"source" in project && project.source && <a href={project.source} target="_blank" rel="noreferrer" className="text-muted hover:text-accent">源代码 ↗</a>}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
