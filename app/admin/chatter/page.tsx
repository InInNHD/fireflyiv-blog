import type { Metadata } from "next";
import ChatterApp from "@/components/chatter-app";

export const metadata: Metadata = {
  title: "管理碎碎念",
  robots: { index: false, follow: false },
};

export default function ChatterAdminPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6 pt-8">
      <header>
        <p className="text-xs uppercase tracking-[0.2em] text-accent">Admin</p>
        <h1 className="mt-1 text-2xl font-bold">管理碎碎念</h1>
        <p className="mt-1 text-sm text-muted">此页面用于发布和检查碎碎念，公开页面保持只读。</p>
      </header>
      <ChatterApp admin />
    </div>
  );
}
