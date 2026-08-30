import type { Metadata } from "next";
import ChatterApp from "@/components/chatter-app";
import Hitokoto from "@/components/hitokoto";

export const metadata: Metadata = { title: "碎碎念" };

export default function ChatterPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6 pt-8">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold">碎碎念</h1>
        <p className="text-sm text-muted">一些零碎的思绪，想说的短话 · 数据存储于自己的服务器（SQLite）</p>
        <Hitokoto className="mt-2" />
      </header>
      <ChatterApp />
    </div>
  );
}