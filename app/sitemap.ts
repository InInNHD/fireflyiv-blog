import type { MetadataRoute } from "next";
import { getAllCategories, getAllPosts, getAllSeries, getAllTags } from "@/lib/blog";

const SITE_URL = process.env.SITE_URL ?? "https://www.fireflyiv.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPosts().map((p) => ({
    url: `${SITE_URL}/posts/${p.slug}`,
    lastModified: new Date(p.updated ?? p.date),
  }));
  const collections = [
    ...getAllTags().map((item) => `/tags/${item.slug}`),
    ...getAllCategories().map((item) => `/categories/${item.slug}`),
    ...getAllSeries().map((item) => `/series/${item.slug}`),
  ].map((pathname) => ({ url: `${SITE_URL}${pathname}`, lastModified: new Date() }));

  return [
    { url: SITE_URL, lastModified: new Date() },
    { url: `${SITE_URL}/posts`, lastModified: new Date() },
    { url: `${SITE_URL}/tags`, lastModified: new Date() },
    { url: `${SITE_URL}/categories`, lastModified: new Date() },
    { url: `${SITE_URL}/series`, lastModified: new Date() },
    { url: `${SITE_URL}/archive`, lastModified: new Date() },
    { url: `${SITE_URL}/chatter`, lastModified: new Date() },
    { url: `${SITE_URL}/anime`, lastModified: new Date() },
    { url: `${SITE_URL}/music`, lastModified: new Date() },
    { url: `${SITE_URL}/gallery`, lastModified: new Date() },
    { url: `${SITE_URL}/links`, lastModified: new Date() },
    { url: `${SITE_URL}/about`, lastModified: new Date() },
    ...posts,
    ...collections,
  ];
}
