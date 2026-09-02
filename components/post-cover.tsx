// 文章封面：有 cover 显示图片；无 cover 时按 slug 哈希生成确定性渐变 + 标题首字
const GRADIENTS = [
  "linear-gradient(135deg, #1b2a4a 0%, #2a4a6b 45%, #7cf0b0 130%)",
  "linear-gradient(135deg, #2a1b3a 0%, #4a2a5b 45%, #ffd873 130%)",
  "linear-gradient(135deg, #0e2a24 0%, #1b4a3a 45%, #7cf0b0 120%)",
  "linear-gradient(135deg, #3a1626 0%, #5b2a3a 45%, #ffb3a7 130%)",
  "linear-gradient(135deg, #101b3a 0%, #1f3577 45%, #9ecbff 130%)",
  "linear-gradient(135deg, #2a2a0e 0%, #4a4a1b 45%, #ffe98a 130%)",
];

function hashCode(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export default function PostCover({
  cover,
  title,
  slug,
  className = "",
}: {
  cover?: string;
  title: string;
  slug: string;
  className?: string;
}) {
  if (cover) {
    return (
      <img
        src={cover}
        alt={title}
        width={1200}
        height={630}
        loading="lazy"
        decoding="async"
        className={"object-cover " + className}
      />
    );
  }
  const bg = GRADIENTS[hashCode(slug) % GRADIENTS.length];
  return (
    <div
      className={"relative overflow-hidden " + className}
      style={{ background: bg }}
    >
      <span
        className="pointer-events-none absolute -right-6 -top-8 size-28 rounded-full opacity-30 blur-xl"
        style={{ background: "var(--accent2)" }}
      />
      <span
        className="pointer-events-none absolute -bottom-10 -left-6 size-32 rounded-full opacity-25 blur-2xl"
        style={{ background: "var(--accent)" }}
      />
      <span className="absolute inset-0 grid place-items-center text-4xl font-bold opacity-90">
        {title.trim().charAt(0) || "✦"}
      </span>
    </div>
  );
}
