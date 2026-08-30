import Link from "next/link";

export default function NotFound() {
  return (
    <div className="grid min-h-[50vh] place-items-center pt-8">
      <div className="card p-10 text-center">
        <p className="text-5xl font-bold text-accent text-glow">404</p>
        <p className="mt-3 text-muted">这只萤火虫迷路了，没找到你要的页面</p>
        <Link href="/" className="btn-accent mt-6">
          回到首页
        </Link>
      </div>
    </div>
  );
}
