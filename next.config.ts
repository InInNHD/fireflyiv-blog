import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Node 模式运行（chatter API 同进程部署）；standalone 让 Docker 镜像更小
  output: "standalone",
};

export default nextConfig;
