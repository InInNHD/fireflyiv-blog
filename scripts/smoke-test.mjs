import assert from "node:assert/strict";

const timeout = 15_000;
const accessPattern = /cloudflareaccess\.com\/cdn-cgi\/access\/login/i;
const request = (url, options = {}) => fetch(url, { redirect: "manual", signal: AbortSignal.timeout(timeout), ...options });
const getText = async (url) => {
  const response = await fetch(url, { signal: AbortSignal.timeout(timeout) });
  assert(response.ok, `${url}: HTTP ${response.status}`);
  return { response, body: await response.text() };
};
const content = async (url, expected) => {
  const { body } = await getText(url);
  assert(body.includes(expected), `${url}: 缺少“${expected}”`);
};
const json = async (url) => {
  const response = await fetch(url, { signal: AbortSignal.timeout(timeout) });
  assert(response.ok, `${url}: HTTP ${response.status}`);
  assert(response.headers.get("content-type")?.includes("application/json"), `${url}: 不是 JSON MIME`);
  await response.json();
};
const access = async (url) => {
  let target = url;
  for (let index = 0; index < 4; index++) {
    const response = await request(target);
    const location = response.headers.get("location");
    assert(location, `${target}: 未跳转到 Access`);
    if (accessPattern.test(location)) return;
    target = new URL(location, target).href;
  }
  throw new Error(`${url}: 未跳转到 Cloudflare Access`);
};

const checks = [
  ["主站", async () => content("https://www.fireflyiv.com/", "FireflyIv")],
  ["Artalk", async () => { await json("https://talk.fireflyiv.com/api/v2/conf"); await access("https://talk.fireflyiv.com/sidebar"); }],
  ["Lsky 图床", async () => content("https://i.fireflyiv.com/", "Lsky Pro")],
  ["Shlink 短链", async () => {
    const response = await request("https://go.fireflyiv.com/");
    assert.equal(response.status, 302);
    assert.equal(new URL(response.headers.get("location"), "https://go.fireflyiv.com/").hostname, "www.fireflyiv.com");
  }],
  ["Shlink 管理", async () => access("https://shlink.fireflyiv.com/")],
  ["一言 API", async () => json("https://api.fireflyiv.com/")],
  ["PrivateBin", async () => content("https://paste.fireflyiv.com/", "FireflyIv 粘贴板")],
  ["Memos", async () => content("https://note.fireflyiv.com/", "Memos")],
  ["Umami", async () => {
    await access("https://stats.fireflyiv.com/");
    const script = await request("https://stats.fireflyiv.com/script.js");
    assert(script.ok, `统计脚本 HTTP ${script.status}`);
    assert(/javascript/i.test(script.headers.get("content-type") ?? ""), "统计脚本 MIME 错误");
    const send = await request("https://stats.fireflyiv.com/api/send");
    assert(!accessPattern.test(send.headers.get("location") ?? ""), "统计采集 API 被 Access 拦截");
  }],
  ["Uptime Kuma", async () => access("https://uptime-kuma.fireflyiv.com/dashboard")],
  ["公开状态页", async () => {
    const url = "https://status.fireflyiv.com/";
    const { body } = await getText(url);
    assert(body.includes("FireflyIv 服务状态"), "状态页标题错误");
    const assets = [...body.matchAll(/(?:src|href)="([^"]+\.(?:js|css)(?:\?[^"]*)?)"/g)].map((match) => new URL(match[1], url).href);
    assert(assets.some((asset) => asset.includes(".js")), "状态页未找到 JS 资源");
    assert(assets.some((asset) => asset.includes(".css")), "状态页未找到 CSS 资源");
    for (const asset of assets.filter((asset) => /\.(?:js|css)(?:\?|$)/.test(asset)).slice(0, 4)) {
      const response = await request(asset);
      const type = response.headers.get("content-type") ?? "";
      assert(response.ok && !type.includes("text/html"), `${asset}: 静态资源返回 ${type || `HTTP ${response.status}`}`);
    }
  }],
  ["Beszel", async () => access("https://monitor.fireflyiv.com/")],
  ["Dashy 导航", async () => content("https://nav.fireflyiv.com/conf.yml", "FireflyIv 导航")],
  ["Vaultwarden", async () => content("https://vault.fireflyiv.com/", "Vaultwarden")],
];

let failed = 0;
for (const [name, check] of checks) {
  const started = performance.now();
  try {
    await check();
    console.log(`PASS  ${name.padEnd(14)} ${Math.round(performance.now() - started)} ms`);
  } catch (error) {
    failed++;
    console.error(`FAIL  ${name.padEnd(14)} ${error.message}`);
  }
}

console.log(`\n${checks.length - failed}/${checks.length} 个公网入口通过`);
if (failed) process.exitCode = 1;
