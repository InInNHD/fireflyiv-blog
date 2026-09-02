import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = path.join(process.cwd(), ".next", "static");
assert(fs.existsSync(root), "请先运行 npm run build");

const files = [];
const walk = (dir) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const target = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(target);
    else files.push({ name: path.relative(root, target), bytes: fs.statSync(target).size });
  }
};
walk(root);

const js = files.filter((file) => file.name.endsWith(".js"));
const css = files.filter((file) => file.name.endsWith(".css"));
const sum = (items) => items.reduce((total, file) => total + file.bytes, 0);
const kib = (bytes) => `${(bytes / 1024).toFixed(1)} KiB`;
const largestJs = Math.max(0, ...js.map((file) => file.bytes));
const jsTotal = sum(js);
const cssTotal = sum(css);

assert(largestJs <= 250 * 1024, `最大 JS chunk ${kib(largestJs)}，超过 250 KiB`);
assert(jsTotal <= 900 * 1024, `全部静态 JS ${kib(jsTotal)}，超过 900 KiB`);
assert(cssTotal <= 100 * 1024, `全部静态 CSS ${kib(cssTotal)}，超过 100 KiB`);

console.log(`performance budget OK: largest JS ${kib(largestJs)}, total JS ${kib(jsTotal)}, total CSS ${kib(cssTotal)}`);
