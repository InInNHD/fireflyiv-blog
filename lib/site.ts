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
}

export interface FriendLink {
  name: string;
  url: string;
  avatar: string;
  desc: string;
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
