import type { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/blog";

const SITE_URL = process.env.SITE_URL ?? "https://www.fireflyiv.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPosts().map((p) => ({
    url: `${SITE_URL}/posts/${p.slug}`,
    lastModified: new Date(p.updated ?? p.date),
  }));

  return [
    { url: SITE_URL, lastModified: new Date() },
    { url: `${SITE_URL}/posts`, lastModified: new Date() },
    { url: `${SITE_URL}/tags`, lastModified: new Date() },
    { url: `${SITE_URL}/archive`, lastModified: new Date() },
    { url: `${SITE_URL}/chatter`, lastModified: new Date() },
    { url: `${SITE_URL}/links`, lastModified: new Date() },
    { url: `${SITE_URL}/about`, lastModified: new Date() },
    ...posts,
  ];
}
