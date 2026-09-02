import type { Metadata } from "next";
import MusicPlayer from "@/components/music-player";
import { getMusicData } from "@/lib/site";

export function generateMetadata(): Metadata {
  return { title: "音乐", description: "FireflyIv 的个人歌单与同步歌词。", alternates: { canonical: "/music" }, robots: getMusicData().tracks.length ? undefined : { index: false, follow: true } };
}

export default function MusicPage() {
  const music = getMusicData();
  return (
    <div className="space-y-7 pt-8">
      <header className="text-center sm:text-left">
        <p className="text-xs uppercase tracking-[0.28em] text-accent">Firefly radio</p>
        <h1 className="mt-2 text-3xl font-bold">萤火乐律</h1>
        <p className="mt-2 text-sm text-muted">{music.intro}</p>
      </header>
      <MusicPlayer data={music} />
    </div>
  );
}
