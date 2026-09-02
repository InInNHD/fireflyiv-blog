import type { Metadata } from "next";
import { getServiceStatus } from "@/lib/status";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "项目与服务",
  description: "FireflyIv 的个人项目与自托管服务矩阵。",
  alternates: { canonical: "/projects" },
};

const PROJECTS = [
  { name: "FireflyIv Blog", monitor: "主站 www", icon: "✦", description: "Next.js 驱动的个人博客，文章、搜索、评论和内容数据均由自己维护。", tags: ["Next.js", "Markdown", "Docker"], href: "https://www.fireflyiv.com", source: "https://github.com/InInNHD/fireflyiv-blog" },
  { name: "服务状态", monitor: "公开状态页 status", icon: "◉", description: "覆盖全部公网入口的内容探针、实时心跳和故障历史。", tags: ["Uptime Kuma", "Monitoring"], href: "https://status.fireflyiv.com" },
  { name: "FireflyIv 导航", monitor: "导航站 nav", icon: "⌘", description: "汇总主站、内容服务、监控工具和常用入口的导航面板。", tags: ["Dashy", "Docker"], href: "https://nav.fireflyiv.com" },
  { name: "一言 API", monitor: "一言 api", icon: "❝", description: "自托管句子库与 Redis 缓存，为主站提供随机一言。", tags: ["API", "Redis"], href: "https://api.fireflyiv.com" },
  { name: "PrivateBin", monitor: "粘贴板 paste", icon: "⌁", description: "浏览器端加密的临时文本分享服务，服务器不读取明文。", tags: ["Privacy", "Self-hosted"], href: "https://paste.fireflyiv.com" },
  { name: "Memos", monitor: "笔记 note", icon: "▤", description: "轻量、自托管的个人笔记与备忘服务。", tags: ["Notes", "Self-hosted"], href: "https://note.fireflyiv.com" },
  { name: "图片服务", monitor: "图床 i", icon: "▧", description: "用于博客图片与个人素材管理的自托管图床。", tags: ["Lsky Pro", "Storage"], href: "https://i.fireflyiv.com" },
  { name: "Artalk 评论", monitor: "评论 talk", icon: "☵", description: "主站文章使用的自托管评论系统，数据保留在自己的服务器。", tags: ["Comments", "SQLite"], href: "https://talk.fireflyiv.com" },
];

export default async function ProjectsPage() {
  const serviceStatus = await getServiceStatus();
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
            <div className="flex items-start justify-between gap-3">
              <div className="grid size-11 place-items-center rounded-xl border border-line bg-surface2 text-xl text-accent">{project.icon}</div>
              {(() => {
                const status = serviceStatus?.monitors[project.monitor]?.status ?? "unknown";
                return <span className={`chip ${status === "up" ? "!text-emerald-400" : status === "down" ? "!text-red-400" : ""}`}><span aria-hidden>{status === "up" ? "●" : status === "down" ? "●" : "○"}</span> {status === "up" ? "正常" : status === "down" ? "异常" : "未知"}</span>;
              })()}
            </div>
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
