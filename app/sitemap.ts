import type { MetadataRoute } from "next";
import { getAllCategories, getAllPosts, getAllSeries, getAllTags } from "@/lib/blog";
import { getAnimeData, getFriendLinks, getGallery, getMusicData } from "@/lib/site";

const SITE_URL = process.env.SITE_URL ?? "https://www.fireflyiv.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const allPosts = getAllPosts();
  const latestPostDate = allPosts[0] ? new Date(allPosts[0].updated ?? allPosts[0].date) : undefined;
  const posts = allPosts.map((p) => ({
    url: `${SITE_URL}/posts/${p.slug}`,
    lastModified: new Date(p.updated ?? p.date),
  }));
  const collections = [
    ...getAllTags().map((item) => `/tags/${item.slug}`),
    ...getAllCategories().map((item) => `/categories/${item.slug}`),
    ...getAllSeries().map((item) => `/series/${item.slug}`),
  ].map((pathname) => ({ url: `${SITE_URL}${pathname}`, lastModified: latestPostDate }));

  const optionalRoutes = [
    getAnimeData().items.length ? "/anime" : null,
    getMusicData().tracks.length ? "/music" : null,
    getGallery().length ? "/gallery" : null,
    getFriendLinks().length ? "/links" : null,
  ].filter((pathname): pathname is string => Boolean(pathname));

  return [
    ...["", "/posts", "/tags", "/categories", "/series", "/archive", "/projects"].map((pathname) => ({
      url: `${SITE_URL}${pathname}`,
      lastModified: latestPostDate,
    })),
    { url: `${SITE_URL}/chatter` },
    { url: `${SITE_URL}/about` },
    ...optionalRoutes.map((pathname) => ({ url: `${SITE_URL}${pathname}` })),
    ...posts,
    ...collections,
  ];
}
