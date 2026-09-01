import type { Metadata } from "next";
import "./globals.css";
import "./click-anim.css";
import Nav from "@/components/nav";
import Fireflies from "@/components/fireflies";
import ClickEffect from "@/components/click-effect";
import MouseTrail from "@/components/mouse-trail";
import ImageLightbox from "@/components/lightbox";
import BackToTop from "@/components/back-to-top";
import { getSiteInfo } from "@/lib/site";

const SITE_URL = process.env.SITE_URL ?? "https://www.fireflyiv.com";

export async function generateMetadata(): Promise<Metadata> {
  const site = getSiteInfo();
  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: `${site.name} — ${site.slogan}`,
      template: `%s · ${site.name}`,
    },
    description: site.description,
    alternates: { canonical: "/" },
    openGraph: {
      type: "website",
      locale: "zh_CN",
      url: SITE_URL,
      siteName: site.name,
      title: `${site.name} — ${site.slogan}`,
      description: site.description,
    },
    twitter: { card: "summary_large_image", title: `${site.name} — ${site.slogan}`, description: site.description },
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.webmanifest" />
        <meta name="theme-color" content="#0b1023" />
        <script
          async
          defer
          src="https://stats.fireflyiv.com/script.js"
          data-website-id="bbfbe70a-b862-4e6b-b1f1-b369a6cbacec"
          data-domains="www.fireflyiv.com"
        />
        <link rel="alternate" type="application/rss+xml" title="RSS" href="/feed.xml" />
        {/* 首屏前恢复主题，避免闪烁 */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("firefly-theme");var light;if(t){light=t==="light"}else{light=window.matchMedia&&window.matchMedia("(prefers-color-scheme: light)").matches}if(light){document.documentElement.classList.add("light")}}catch(e){}})();`,
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `if("serviceWorker"in navigator){window.addEventListener("load",function(){navigator.serviceWorker.register("/sw.js").catch(function(){})})}`,
          }}
        />
      </head>
      <body>
        <ClickEffect />
        <MouseTrail />
        <ImageLightbox />
        <BackToTop />
        <Fireflies />
        <Nav />
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-16">{children}</main>
        <footer className="border-t border-line px-4 py-8 text-center text-sm text-muted">
          <nav aria-label="分站导航" className="mb-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5">
            <a href="https://stats.fireflyiv.com" target="_blank" rel="noreferrer" className="transition-colors hover:text-accent">📊 统计</a>
            <a href="https://i.fireflyiv.com" target="_blank" rel="noreferrer" className="transition-colors hover:text-accent">🖼️ 图床</a>
            <a href="https://go.fireflyiv.com" target="_blank" rel="noreferrer" className="transition-colors hover:text-accent">🔗 短链</a>
            <a href="https://api.fireflyiv.com" target="_blank" rel="noreferrer" className="transition-colors hover:text-accent">✨ 一言</a>
            <a href="/feed.xml" className="transition-colors hover:text-accent">📡 RSS</a>
          </nav>
          <p>
            © {new Date().getFullYear()} <span className="text-accent">FireflyIv</span>
            {" "}· 用 {process.env.NODE_ENV === "production" ? "心" : "爱"} 编写 ·{" "}
            <span className="text-glow">萤火虽微,愿为其芒</span>
          </p>
        </footer>
      </body>
    </html>
  );
}
