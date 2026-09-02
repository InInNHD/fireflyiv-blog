import type { NextConfig } from "next";

// 安全响应头（全站所有路由生效）
// CSP 说明：script/style 保留 'unsafe-inline' 以兼容 Next 内联启动脚本与 shiki 内联样式；
// 图床/一言/统计/评论均为本站受信任子域。若后续接入新外部资源，在这里同步放行。
const securityHeaders = [
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' https://stats.fireflyiv.com https://challenges.cloudflare.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https:",
      "media-src 'self' https:",
      "font-src 'self' data:",
      "connect-src 'self' https://api.fireflyiv.com https://stats.fireflyiv.com https://talk.fireflyiv.com https://challenges.cloudflare.com",
      "frame-src 'self' https://talk.fireflyiv.com https://challenges.cloudflare.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'self'",
      "upgrade-insecure-requests",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  // Node 模式运行（chatter API 同进程部署）；standalone 让 Docker 镜像更小
  output: "standalone",
  // 不暴露 x-powered-by，减少指纹信息
  poweredByHeader: false,
  async headers() {
    const publicAssetCache = [{ key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" }];
    return [
      { source: "/:path*", headers: securityHeaders },
      { source: "/admin/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] },
      { source: "/covers/:path*", headers: publicAssetCache },
      { source: "/gallery/:path*", headers: publicAssetCache },
      { source: "/music/:path*", headers: publicAssetCache },
    ];
  },
};

export default nextConfig;
