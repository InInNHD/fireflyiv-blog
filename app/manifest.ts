import type { MetadataRoute } from "next";

// 基础 PWA：可安装清单（Web App Manifest）
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "FireflyIv 的萤火小站",
    short_name: "FireflyIv",
    description: "萤火虽微，愿为其芒 —— FireflyIv 的个人博客",
    start_url: "/",
    display: "standalone",
    background_color: "#0b1023",
    theme_color: "#0b1023",
    icons: [
      {
        src: "/favicon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
