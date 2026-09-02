import Link from "next/link";
import Image from "next/image";
import Hitokoto from "@/components/hitokoto";
import HomeSearchTrigger from "@/components/home-search-trigger";
import PostCard from "@/components/post-card";
import { getListedPosts } from "@/lib/blog";
import { countChatter, listChatter } from "@/lib/db";
import { getAnimeData, getGallery, getMusicData, getSiteInfo } from "@/lib/site";

export const revalidate = 60;

interface StatusMonitor {
  id: number;
  name: string;
}

interface StatusHeartbeat {
  status: number;
  time?: string;
}

async function getServiceStatus() {
  try {
    const [configResponse, heartbeatResponse] = await Promise.all([
      fetch("https://status.fireflyiv.com/api/status-page/firefly", {
        next: { revalidate: 60 },
        signal: AbortSignal.timeout(2500),
      }),
      fetch("https://status.fireflyiv.com/api/status-page/heartbeat/firefly", {
        next: { revalidate: 60 },
        signal: AbortSignal.timeout(2500),
      }),
    ]);
    if (!configResponse.ok || !heartbeatResponse.ok) throw new Error("status api failed");
    const config = await configResponse.json();
    const heartbeat = await heartbeatResponse.json();
    const monitors = (config.publicGroupList ?? []).flatMap(
      (group: { monitorList?: StatusMonitor[] }) => group.monitorList ?? [],
    );
    const heartbeatList = (heartbeat.heartbeatList ?? {}) as Record<string, StatusHeartbeat[]>;
    const latest = monitors.map((monitor: StatusMonitor) => ({
      monitor,
      heartbeat: heartbeatList[String(monitor.id)]?.at(-1),
    }));
    const up = latest.filter((item: { heartbeat?: StatusHeartbeat }) => item.heartbeat?.status === 1).length;
    const down = latest.filter((item: { heartbeat?: StatusHeartbeat }) => item.heartbeat?.status !== 1).map((item: { monitor: StatusMonitor }) => item.monitor.name);
    const checkedAt = latest.map((item: { heartbeat?: StatusHeartbeat }) => item.heartbeat?.time).filter(Boolean).sort().at(-1);
    return { up, total: monitors.length, down, checkedAt };
  } catch {
    return null;
  }
}

export default async function HomePage() {
  const site = getSiteInfo();
  const allPosts = getListedPosts();
  const posts = allPosts.slice(0, 4);
  const anime = getAnimeData();
  const gallery = getGallery();
  const music = getMusicData();
  const chatter = listChatter(undefined, 1).items[0];
  const chatterCount = countChatter();
  const watching = anime.items.find((item) => item.status === "watching");
  const currentTrack = music.tracks[0];
  const serviceStatus = await getServiceStatus();
  const summaryColumns = 1 + Number(chatterCount > 0) + Number(gallery.length > 0);
  const hasNow = Boolean(site.now?.game || site.now?.music || site.now?.note);

  return (
    <div className="space-y-6 pt-6 sm:pt-8">
      <HomeSearchTrigger />

      <section className={currentTrack ? "grid gap-4 lg:grid-cols-[1.35fr_0.85fr]" : ""} aria-label="个人简介与当前音乐">
        <article className="glass-panel glass-feature overflow-hidden p-5 sm:p-6">
          <div className="flex items-center gap-4 sm:gap-5">
            <Image
              src={site.avatar}
              alt={`${site.nick} 的头像`}
              width={96}
              height={96}
              priority
              sizes="(min-width: 640px) 96px, 80px"
              className="size-20 shrink-0 rounded-2xl border border-line object-cover shadow-[0_0_30px_color-mix(in_srgb,var(--accent)_22%,transparent)] sm:size-24"
            />
            <div className="min-w-0 flex-1">
              <p className="text-xs uppercase tracking-[0.24em] text-accent">Hello, I am</p>
              <h1 className="text-glow mt-1 text-2xl font-bold sm:text-3xl">{site.nick}</h1>
              <p className="mt-1 text-sm text-muted">{site.slogan}</p>
              <p className="mt-2 line-clamp-2 max-w-2xl text-sm leading-relaxed text-muted sm:mt-3">{site.description}</p>
            </div>
          </div>
          <Hitokoto className="mt-4 hidden max-w-2xl sm:block" />
          <div className={`mt-5 grid gap-2 text-center ${summaryColumns === 3 ? "grid-cols-3" : summaryColumns === 2 ? "grid-cols-2" : "grid-cols-1"}`}>
            <Link href="/posts" className="rounded-xl bg-surface2 px-2 py-3"><strong className="block text-lg text-accent">{allPosts.length}</strong><span className="text-xs text-muted">文章</span></Link>
            {chatterCount > 0 && <Link href="/chatter" className="rounded-xl bg-surface2 px-2 py-3"><strong className="block text-lg text-accent">{chatterCount}</strong><span className="text-xs text-muted">动态</span></Link>}
            {gallery.length > 0 && <Link href="/gallery" className="rounded-xl bg-surface2 px-2 py-3"><strong className="block text-lg text-accent">{gallery.length}</strong><span className="text-xs text-muted">相册</span></Link>}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {site.social.github && <a href={site.social.github} target="_blank" rel="noreferrer" className="chip">GitHub ↗</a>}
            {site.social.email && <a href={`mailto:${site.social.email}`} className="chip">Email</a>}
            {site.social.rss && <a href={site.social.rss} className="chip">RSS</a>}
          </div>
        </article>

        {currentTrack && <article className="glass-panel flex min-h-48 flex-col justify-between overflow-hidden p-5 sm:min-h-64 sm:p-6">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-accent">Now playing</p>
            <div className="mt-3 grid size-16 place-items-center rounded-full border-[6px] border-bg bg-surface2 text-2xl shadow-[0_0_28px_color-mix(in_srgb,var(--accent)_18%,transparent)] sm:mt-5 sm:size-20 sm:border-[7px] sm:text-3xl">♫</div>
            <h2 className="mt-3 text-xl font-semibold sm:mt-5">{currentTrack.title}</h2>
            <p className="mt-1 text-sm text-muted">{currentTrack.artist}</p>
          </div>
          <audio className="mt-5 w-full" controls preload="none" src={currentTrack.src}>当前浏览器不支持音频播放。</audio>
        </article>}
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-label="站点近况">
        {chatter && <Link href="/chatter" className="glass-panel glass-panel-hover min-h-40 p-5 lg:col-span-2">
          <p className="text-xs text-accent">最新碎碎念</p>
          <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-muted">{chatter.content}</p>
          <span className="mt-4 inline-block text-xs text-muted">共 {chatterCount} 条 →</span>
        </Link>}
        {gallery[0] && <Link href="/gallery" className="glass-panel glass-panel-hover min-h-40 overflow-hidden p-5">
          <p className="text-xs text-accent">最近相册</p>
          <p className="mt-4 font-medium">{gallery[0].caption ?? gallery[0].alt}</p>
          <p className="mt-2 text-xs text-muted">{gallery[0].date ?? "查看相册"} →</p>
        </Link>}
        {watching && <Link href="/anime" className="glass-panel glass-panel-hover min-h-40 p-5">
          <p className="text-xs text-accent">正在追番</p>
          <p className="mt-4 font-medium">{watching.title}</p>
          <p className="mt-2 text-xs text-muted">{watching.progress ?? `${anime.items.length} 部记录`} →</p>
        </Link>}
        <a href="https://status.fireflyiv.com" target="_blank" rel="noreferrer" className="glass-panel glass-panel-hover min-h-32 p-5 sm:col-span-2 lg:col-span-1">
          <p className="text-xs text-accent">服务状态</p>
          <p className="mt-3 text-2xl font-semibold">{serviceStatus ? `${serviceStatus.up}/${serviceStatus.total}` : "查看状态"}</p>
          <p className="mt-1 text-xs text-muted">
            {serviceStatus?.down.length ? `${serviceStatus.down.slice(0, 2).join("、")} 异常` : serviceStatus ? "全部服务正常" : "打开实时状态页 →"}
          </p>
          {serviceStatus?.checkedAt && <p className="mt-2 text-[11px] text-muted">最近探测 {serviceStatus.checkedAt.slice(5, 16)}</p>}
        </a>
        <Link href="/projects" className="glass-panel glass-panel-hover min-h-32 p-5 sm:col-span-2 lg:col-span-1">
          <p className="text-xs text-accent">项目与服务</p>
          <p className="mt-3 text-lg font-semibold">自托管服务矩阵</p>
          <p className="mt-1 text-xs text-muted">查看主站与公开子站 →</p>
        </Link>
        {hasNow && <div className="glass-panel min-h-32 p-5 sm:col-span-2 lg:col-span-3">
          <p className="text-xs text-accent">最近状态</p>
          <div className="mt-3 grid gap-2 text-sm sm:grid-cols-3">
            {site.now?.game && <div className="rounded-xl bg-surface2 p-3"><span className="text-muted">🎮 在玩</span><strong className="mt-1 block">{site.now.game}</strong></div>}
            {site.now?.music && <Link href="/music" className="rounded-xl bg-surface2 p-3"><span className="text-muted">🎧 在听</span><strong className="mt-1 block">{site.now.music}</strong></Link>}
            {site.now?.note && <div className="rounded-xl bg-surface2 p-3"><span className="text-muted">✨ 近况</span><strong className="mt-1 block">{site.now.note}</strong></div>}
          </div>
        </div>}
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">最新文章</h2>
          <Link href="/posts" className="chip">全部文章 →</Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {posts.map((post) => <PostCard key={post.slug} post={post} />)}
        </div>
      </section>
    </div>
  );
}
