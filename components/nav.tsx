"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import SearchDialog from "./search-dialog";
import ThemeToggle from "./theme-toggle";

const LINKS = [
  { href: "/", label: "首页" },
  { href: "/posts", label: "文章" },
  { href: "/categories", label: "分类" },
  { href: "/tags", label: "标签" },
  { href: "/series", label: "系列" },
  { href: "/archive", label: "归档" },
  { href: "/chatter", label: "碎碎念" },
  { href: "/anime", label: "追番" },
  { href: "/music", label: "音乐" },
  { href: "/gallery", label: "相册" },
  { href: "/links", label: "友链" },
  { href: "/about", label: "关于" },
];

export default function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const active = (href: string) => href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const navLink = (link: (typeof LINKS)[number], compact = false) => (
    <Link
      key={link.href}
      href={link.href}
      aria-current={active(link.href) ? "page" : undefined}
      className={`${compact ? "px-2 py-1.5" : "px-3 py-1.5"} rounded-full text-muted transition-colors hover:bg-surface2 hover:text-fg aria-[current=page]:bg-surface2 aria-[current=page]:text-accent`}
    >
      {link.label}
    </Link>
  );

  return (
    <>
    <header className="sticky top-0 z-40 border-b border-line bg-bg/70 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <Link href="/" aria-current={pathname === "/" ? "page" : undefined} className="flex items-center gap-2 text-lg font-bold tracking-wide">
          <span className="inline-block size-2.5 rounded-full bg-accent shadow-[0_0_10px_2px_color-mix(in_srgb,var(--accent)_60%,transparent)]" />
          <span className="text-glow">Firefly<span className="text-accent">Iv</span></span>
        </Link>

        <nav aria-label="主导航" className="hidden items-center gap-1 text-sm whitespace-nowrap md:flex">
          {LINKS.map((link) => navLink(link))}
          <SearchDialog />
          <ThemeToggle />
        </nav>

        <nav aria-label="移动端主导航" className="flex items-center gap-0.5 text-sm whitespace-nowrap md:hidden">
          {LINKS.slice(0, 2).map((link) => navLink(link, true))}
          <SearchDialog />
          <ThemeToggle />
          <button
            type="button"
            className="chip cursor-pointer select-none"
            aria-label="打开全部导航"
            aria-controls="mobile-nav-drawer"
            aria-expanded={open}
            onClick={() => setOpen(true)}
          >
            <span aria-hidden>☰</span>
          </button>
        </nav>
      </div>

    </header>

      {open && (
        <div className="fixed inset-0 top-[57px] z-50 bg-black/55 backdrop-blur-sm md:hidden" onClick={() => setOpen(false)}>
          <aside
            id="mobile-nav-drawer"
            aria-label="全部导航"
            className="ml-auto h-full w-[min(82vw,20rem)] border-l border-line bg-bg p-5 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-5 flex items-center justify-between">
              <strong>全部入口</strong>
              <button type="button" className="chip cursor-pointer" onClick={() => setOpen(false)} aria-label="关闭全部导航">×</button>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {LINKS.slice(2).map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active(link.href) ? "page" : undefined}
                  className="rounded-xl border border-line bg-surface px-4 py-3 text-muted transition-colors hover:border-accent hover:text-fg aria-[current=page]:border-accent aria-[current=page]:text-accent"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
