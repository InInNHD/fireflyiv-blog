import Link from "next/link";
import ThemeToggle from "./theme-toggle";
import SearchDialog from "./search-dialog";

const LINKS = [
  { href: "/", label: "首页" },
  { href: "/posts", label: "文章" },
  { href: "/tags", label: "标签" },
  { href: "/archive", label: "归档" },
  { href: "/chatter", label: "碎碎念" },
  { href: "/links", label: "友链" },
  { href: "/about", label: "关于" },
];

export default function Nav() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/70 backdrop-blur-md">
      <div className="mx-auto flex max-w-4xl items-center justify-between gap-3 px-4 py-3">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold tracking-wide">
          <span className="inline-block size-2.5 rounded-full bg-accent shadow-[0_0_10px_2px_color-mix(in_srgb,var(--accent)_60%,transparent)]" />
          <span className="text-glow">Firefly<span className="text-accent">Iv</span></span>
        </Link>
        <nav className="flex items-center gap-1 overflow-x-auto text-sm whitespace-nowrap">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-full px-3 py-1.5 text-muted transition-colors hover:bg-surface2 hover:text-fg"
            >
              {l.label}
            </Link>
          ))}
          <SearchDialog />
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
