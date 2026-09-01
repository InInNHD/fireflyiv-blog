# syntax=docker/dockerfile:1
# 注意：使用 Node 24（内置 node:sqlite，碎碎念存储依赖，无需原生编译）
# ---------- 构建阶段 ----------
FROM node:24-alpine AS builder
WORKDIR /app

# NEXT_PUBLIC_* 变量在 next build 时才注入前端产物，必须作为构建参数传入
ARG NEXT_PUBLIC_ARTALK_SERVER=https://talk.fireflyiv.com
ENV NEXT_PUBLIC_ARTALK_SERVER=$NEXT_PUBLIC_ARTALK_SERVER

COPY package.json package-lock.json* ./
RUN npm ci --no-audit --no-fund

COPY . .

# 生产构建（standalone 输出，产物自包含）
ENV NODE_ENV=production \
    SITE_URL=https://www.fireflyiv.com
RUN npm run build

# ---------- 运行阶段 ----------
FROM node:24-alpine AS runner
WORKDIR /app

# 注意：容器内必须监听 0.0.0.0，端口映射才能转发；
# 主机侧的安全隔离由 docker-compose 的 "127.0.0.1:xxx:xxx" 映射保证
ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME=0.0.0.0 \
    SITE_URL=https://www.fireflyiv.com \
    NEXT_PUBLIC_ARTALK_SERVER=https://talk.fireflyiv.com

# standalone 产物：服务端代码 + 公共资源
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
# 内容目录（文章/站点配置，随镜像打入）
COPY --from=builder /app/content ./content

# 运行时数据卷（chatter SQLite 等）
RUN mkdir -p /app/data
VOLUME ["/app/data"]

EXPOSE 3000
CMD ["node", "server.js"]