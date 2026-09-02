const sqlite3 = require("@louislam/sqlite3");

const dbPath = process.env.KUMA_DB_PATH || "/app/data/kuma.db";
const db = new sqlite3.Database(dbPath);

const monitors = [
  ["主站 www", "keyword", "https://www.fireflyiv.com", "FireflyIv", null, null],
  ["评论 talk", "keyword", "http://127.0.0.1:1234", "Artalk", null, null],
  ["统计 stats", "keyword", "http://127.0.0.1:8700", "Umami", null, null],
  ["一言 api", "json-query", "https://api.fireflyiv.com", null, "$type($)", "object"],
  ["图床 i", "keyword", "https://i.fireflyiv.com", "Lsky Pro", null, null],
  ["短链 go", "keyword", "https://go.fireflyiv.com", "FireflyIv", null, null],
  ["短链管理 shlink", "keyword", "http://127.0.0.1:8705", "Shlink", null, null],
  ["粘贴板 paste", "keyword", "https://paste.fireflyiv.com", "FireflyIv 粘贴板", null, null],
  ["笔记 note", "keyword", "https://note.fireflyiv.com", "Memos", null, null],
  ["可用性监控 uptime-kuma", "keyword", "http://127.0.0.1:3001", "Uptime Kuma", null, null],
  ["公开状态页 status", "keyword", "https://status.fireflyiv.com/status/firefly", "FireflyIv 服务状态", null, null],
  ["服务器监控 monitor", "keyword", "http://127.0.0.1:8706", "Beszel", null, null],
  ["导航站 nav", "keyword", "https://nav.fireflyiv.com/conf.yml", "FireflyIv 导航", null, null],
  ["密码库 vault", "keyword", "https://vault.fireflyiv.com", "Vaultwarden Web", null, null],
];

function get(sql, params = []) {
  return new Promise((resolve, reject) => db.get(sql, params, (error, row) => error ? reject(error) : resolve(row)));
}

function run(sql, params = []) {
  return new Promise((resolve, reject) => db.run(sql, params, function (error) {
    if (error) reject(error);
    else resolve({ id: this.lastID, changes: this.changes });
  }));
}

async function main() {
  const backup = `/app/data/kuma.db.pre-content-monitors-${Date.now()}.bak`;
  await run("VACUUM INTO ?", [backup]);

  const group = await get("SELECT id FROM [group] WHERE status_page_id = (SELECT id FROM status_page WHERE slug = 'firefly')");
  if (!group) throw new Error("找不到 firefly 状态页分组");

  await run("BEGIN IMMEDIATE");
  try {
    const ids = [];
    for (let weight = 0; weight < monitors.length; weight += 1) {
      const [name, type, url, keyword, jsonPath, expectedValue] = monitors[weight];
      const existing = await get("SELECT id FROM monitor WHERE name = ? ORDER BY id LIMIT 1", [name]);
      let id = existing?.id;

      if (id) {
        await run(
          "UPDATE monitor SET name = ?, type = ?, url = ?, keyword = ?, json_path = ?, expected_value = ?, active = 1, interval = 60, accepted_statuscodes_json = ? WHERE id = ?",
          [name, type, url, keyword, jsonPath, expectedValue, '["200-299","301","302"]', id],
        );
      } else {
        const result = await run(
          "INSERT INTO monitor (name, type, url, keyword, json_path, expected_value, user_id, interval, accepted_statuscodes_json) VALUES (?, ?, ?, ?, ?, ?, 1, 60, ?)",
          [name, type, url, keyword, jsonPath, expectedValue, '["200-299","301","302"]'],
        );
        id = result.id;
      }
      ids.push(id);
    }

    await run("UPDATE monitor SET active = 0 WHERE url = 'https://fireflyiv.com'");
    await run("DELETE FROM monitor_group WHERE group_id = ?", [group.id]);
    for (let weight = 0; weight < ids.length; weight += 1) {
      await run(
        "INSERT INTO monitor_group (monitor_id, group_id, weight, send_url) VALUES (?, ?, ?, 0)",
        [ids[weight], group.id, 1000 + weight],
      );
      await run(
        "INSERT INTO monitor_notification (monitor_id, notification_id) SELECT ?, n.id FROM notification n WHERE n.active = 1 AND NOT EXISTS (SELECT 1 FROM monitor_notification mn WHERE mn.monitor_id = ? AND mn.notification_id = n.id)",
        [ids[weight], ids[weight]],
      );
    }
    await run("COMMIT");
    console.log(JSON.stringify({ backup, monitors: monitors.length }));
  } catch (error) {
    await run("ROLLBACK");
    throw error;
  }
}

main().finally(() => db.close());
