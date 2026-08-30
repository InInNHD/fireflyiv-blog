import { Client } from "pg";

export const dynamic = "force-dynamic";

// 文章浏览量：直查 Umami(Postgres) 的 website_event 表（event_type=1 即 pageview）
export async function GET(request: Request) {
  const url = new URL(request.url);
  const slug = url.searchParams.get("slug") ?? "";
  if (!/^[a-z0-9-]+$/i.test(slug)) {
    return Response.json({ views: 0 });
  }
  const conn = process.env.UMAMI_PG_URL;
  const websiteId = process.env.UMAMI_WEBSITE_ID;
  if (!conn || !websiteId) {
    return Response.json({ views: 0 });
  }
  const client = new Client({ connectionString: conn, connectionTimeoutMillis: 3000 });
  try {
    await client.connect();
    const res = await client.query(
      "SELECT COUNT(*)::int AS views FROM website_event WHERE website_id = $1 AND event_type = 1 AND url_path = $2",
      [websiteId, "/posts/" + slug]
    );
    return Response.json(
      { views: res.rows[0]?.views ?? 0 },
      { headers: { "Cache-Control": "public, max-age=300" } }
    );
  } catch {
    return Response.json({ views: 0 });
  } finally {
    await client.end().catch(() => {});
  }
}
