import type { Metadata } from "next";
import { getGallery } from "@/lib/site";

export const metadata: Metadata = { title: "相册", description: "FireflyIv 的图片与小站记忆", alternates: { canonical: "/gallery" } };

export default function GalleryPage() {
  const items = getGallery();
  return (
    <div className="space-y-7 pt-8">
      <header><h1 className="text-2xl font-bold">萤火相册</h1><p className="mt-1 text-sm text-muted">留住图片，也留住当时的心情。点击图片可以放大。</p></header>
      {items.length === 0 ? (
        <div className="card p-8 text-center text-muted">真实照片还在整理中；文章封面不再作为相册内容展示。</div>
      ) : (
        <div data-lightbox className="columns-1 gap-4 sm:columns-2 lg:columns-3">
          {items.map((item) => (
            <figure key={item.src} className="card mb-4 break-inside-avoid overflow-hidden">
              <img src={item.src} alt={item.alt} loading="lazy" className="w-full cursor-zoom-in object-cover" />
              {(item.caption || item.date) && (
                <figcaption className="space-y-1 p-3 text-sm"><p>{item.caption}</p>{item.date && <time className="text-xs text-muted">{item.date}</time>}</figcaption>
              )}
            </figure>
          ))}
        </div>
      )}
    </div>
  );
}
