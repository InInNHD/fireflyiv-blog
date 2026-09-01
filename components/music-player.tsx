"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { MusicData } from "@/lib/site";
import { parseLrc } from "@/lib/lrc.mjs";

function clock(value: number) {
  if (!Number.isFinite(value)) return "0:00";
  const minutes = Math.floor(value / 60);
  return `${minutes}:${String(Math.floor(value % 60)).padStart(2, "0")}`;
}

export default function MusicPlayer({ data }: { data: MusicData }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const lyricBoxRef = useRef<HTMLDivElement>(null);
  const activeLyricRef = useRef<HTMLButtonElement>(null);
  const [current, setCurrent] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [panel, setPanel] = useState<"lyrics" | "playlist">("lyrics");
  const track = data.tracks[current];
  const lyrics = useMemo(() => parseLrc(track?.lyrics ?? ""), [track?.lyrics]);
  const activeLyric = useMemo(() => {
    for (let index = lyrics.length - 1; index >= 0; index--) {
      if (time >= lyrics[index].time) return index;
    }
    return -1;
  }, [lyrics, time]);

  useEffect(() => {
    const box = lyricBoxRef.current;
    const line = activeLyricRef.current;
    if (box && line) box.scrollTo({ top: line.offsetTop - box.clientHeight / 2 + line.clientHeight / 2, behavior: "smooth" });
  }, [activeLyric]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.load();
    setTime(0);
    setDuration(0);
    if (playing) audio.play().catch(() => setPlaying(false));
  }, [current]); // 切歌后沿用用户已经触发的播放状态

  if (!track) {
    return (
      <div className="music-stage">
        <section className="glass-panel music-control" aria-label="空歌单">
          <span className="music-empty-disc" aria-hidden>♫</span>
          <p className="mt-7 text-xs uppercase tracking-[0.24em] text-accent">Firefly radio</p>
          <h2 className="mt-2 text-xl font-semibold">歌单等待点亮</h2>
          <p className="mt-1 text-sm text-muted">尚未添加曲目</p>
          <input className="music-range mt-7" type="range" min="0" max="100" value="0" disabled aria-label="播放进度" readOnly />
          <div className="mt-1 flex w-full justify-between font-mono text-xs text-muted"><span>0:00</span><span>0:00</span></div>
          <div className="mt-6 flex items-center gap-5 opacity-40" aria-hidden>
            <button type="button" className="music-skip" disabled>‹</button><button type="button" className="music-play" disabled>▶</button><button type="button" className="music-skip" disabled>›</button>
          </div>
        </section>
        <section className="glass-panel music-detail" aria-label="歌词配置说明">
          <div className="music-tabs"><button type="button" aria-selected="true">歌词</button><button type="button" aria-selected="false" disabled>歌单</button></div>
          <div className="music-guide">
            <p>♪ 同步歌词会随旋律在这里流动</p>
            <p>在 <code>content/music.json</code> 添加歌曲与 LRC</p>
            <p>音频建议放入 <code>public/music/</code></p>
          </div>
        </section>
      </div>
    );
  }

  const selectTrack = (index: number) => setCurrent((index + data.tracks.length) % data.tracks.length);
  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) audio.play().catch(() => setPlaying(false));
    else audio.pause();
  };
  const seek = (percent: number) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;
    audio.currentTime = duration * percent / 100;
    setTime(audio.currentTime);
  };

  return (
    <div className="music-stage">
      {track.cover && <div className="music-ambient" style={{ backgroundImage: `url(${track.cover})` }} />}
      <section className="glass-panel music-control" aria-label="音乐播放器">
        <div className={`music-cover ${playing ? "is-playing" : ""}`}>
          {track.cover ? <img src={track.cover} alt={`${track.title} 封面`} /> : <span aria-hidden>♫</span>}
        </div>
        <p className="mt-7 text-xs uppercase tracking-[0.24em] text-accent">Now playing</p>
        <h2 className="mt-2 text-center text-2xl font-bold">{track.title}</h2>
        <p className="mt-1 text-sm text-muted">{track.artist}</p>

        <label className="mt-7 w-full">
          <span className="sr-only">播放进度</span>
          <input className="music-range" type="range" min="0" max="100" step="0.1" value={duration ? time / duration * 100 : 0} onChange={(event) => seek(Number(event.target.value))} />
        </label>
        <div className="mt-1 flex w-full justify-between font-mono text-xs text-muted">
          <span>{clock(time)}</span><span>{clock(duration)}</span>
        </div>

        <div className="mt-6 flex items-center gap-5">
          <button type="button" className="music-skip" onClick={() => selectTrack(current - 1)} aria-label="上一首">‹</button>
          <button type="button" className="music-play" onClick={toggle} aria-label={playing ? "暂停" : "播放"}>{playing ? "Ⅱ" : "▶"}</button>
          <button type="button" className="music-skip" onClick={() => selectTrack(current + 1)} aria-label="下一首">›</button>
        </div>
        <audio
          ref={audioRef}
          src={track.src}
          preload="metadata"
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onTimeUpdate={(event) => setTime(event.currentTarget.currentTime)}
          onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)}
          onEnded={() => selectTrack(current + 1)}
        />
      </section>

      <section className="glass-panel music-detail" aria-label="歌词与歌单">
        <div className="music-tabs" role="tablist" aria-label="音乐信息">
          <button type="button" role="tab" aria-selected={panel === "lyrics"} onClick={() => setPanel("lyrics")}>歌词</button>
          <button type="button" role="tab" aria-selected={panel === "playlist"} onClick={() => setPanel("playlist")}>歌单</button>
        </div>
        {panel === "lyrics" ? (
          <div ref={lyricBoxRef} className="music-lyrics" aria-live="off">
            {lyrics.length ? lyrics.map((line, index) => (
              <button
                key={`${line.time}-${index}`}
                ref={index === activeLyric ? activeLyricRef : undefined}
                type="button"
                className={index === activeLyric ? "active" : ""}
                onClick={() => {
                  if (audioRef.current) audioRef.current.currentTime = line.time;
                }}
              >{line.text}</button>
            )) : <p className="music-no-lyric">♪ 这首歌暂时没有同步歌词</p>}
          </div>
        ) : (
          <div className="music-playlist">
            {data.tracks.map((item, index) => (
              <button type="button" key={`${item.title}-${item.artist}`} className={index === current ? "active" : ""} onClick={() => selectTrack(index)}>
                <span className="music-list-index">{String(index + 1).padStart(2, "0")}</span>
                <span className="min-w-0 text-left"><strong className="block truncate">{item.title}</strong><small className="block truncate text-muted">{item.artist}</small></span>
                {index === current && <span className="ml-auto text-accent" aria-label="当前歌曲">♪</span>}
              </button>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
