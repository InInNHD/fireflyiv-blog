import fs from "node:fs";
import path from "node:path";

export interface SiteInfo {
  name: string;
  nick: string;
  slogan: string;
  description: string;
  avatar: string;
  social: {
    github?: string;
    bilibili?: string;
    email?: string;
    rss?: string;
  };
  icp?: string;
  now?: {
    game?: string;
    music?: string;
    note?: string;
  };
}

export interface FriendLink {
  name: string;
  url: string;
  avatar: string;
  desc: string;
}

export type AnimeStatus = "watching" | "completed" | "planned" | "paused";

export interface AnimeItem {
  title: string;
  status: AnimeStatus;
  progress?: string;
  rating?: number;
  cover?: string;
  comment?: string;
  url?: string;
}

export interface AnimeData {
  intro: string;
  items: AnimeItem[];
}

export interface GalleryItem {
  src: string;
  alt: string;
  caption?: string;
  date?: string;
}

export interface MusicTrack {
  title: string;
  artist: string;
  src: string;
  cover?: string;
  lyrics?: string;
}

export interface MusicData {
  intro: string;
  tracks: MusicTrack[];
}

function readJson<T>(file: string): T {
  const raw = fs.readFileSync(path.join(process.cwd(), "content", file), "utf-8");
  return JSON.parse(raw) as T;
}

export function getSiteInfo(): SiteInfo {
  return readJson<SiteInfo>("site.json");
}

export function getFriendLinks(): FriendLink[] {
  return readJson<FriendLink[]>("links.json");
}

export function getAnimeData(): AnimeData {
  return readJson<AnimeData>("anime.json");
}

export function getGallery(): GalleryItem[] {
  return readJson<GalleryItem[]>("gallery.json");
}

export function getMusicData(): MusicData {
  return readJson<MusicData>("music.json");
}
