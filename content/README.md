# 内容维护

提交前运行：

```bash
npm run check:content
```

文章放在 `posts/`，文件名使用 ASCII kebab-case。必填 frontmatter：

```yaml
---
title: 标题
date: 2026-09-02
category: "分类名:category-slug"
series: "系列名:series-slug"
tags: ["标签名:tag-slug"]
description: 一句话摘要
draft: true
comment: true
---
```

`anime.json` 的条目格式：

```json
{
  "title": "动画名",
  "status": "watching",
  "progress": "6/12",
  "rating": 8,
  "cover": "/anime/example.webp",
  "comment": "短评",
  "url": "https://example.com"
}
```

`status` 只能是 `watching`、`completed`、`planned` 或 `paused`。

`gallery.json` 的条目格式：

```json
{
  "src": "/gallery/example.webp",
  "alt": "可替代图片的信息描述",
  "caption": "可选说明",
  "date": "2026-09-02"
}
```

先把原图放入 `incoming/gallery`，执行 `npm run prepare:gallery`。脚本会自动纠正方向、剥离 EXIF/GPS，生成 WebP、AVIF、缩略图与 `public/gallery/manifest.json`。从 manifest 复制需要的 `src` 到 `gallery.json`，并把占位 `alt` 改为真实描述；内容检查还会拦截超过 2 MiB、超过 2560×2560 或内容重复的站内图片。

`music.json` 的曲目格式：

```json
{
  "title": "歌曲名",
  "artist": "歌手",
  "src": "/music/example.mp3",
  "cover": "/music/example.webp",
  "lyrics": "[00:01.00]第一句歌词"
}
```

音频只使用有权公开托管的文件。站内图片、音频路径必须对应 `public/` 中的真实文件；外部资源只接受 HTTPS。
