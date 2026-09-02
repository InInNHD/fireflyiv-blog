import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const args = process.argv.slice(2);
if (args.includes("--help")) {
  console.log("用法: npm run prepare:gallery -- <原图目录> [输出目录]\n默认输出到 public/gallery；不会改写 content/gallery.json。");
  process.exit(0);
}

const root = process.cwd();
const inputDir = path.resolve(root, args[0] ?? "incoming/gallery");
const outputDir = path.resolve(root, args[1] ?? "public/gallery");
const extensions = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif"]);

let names;
try {
  names = (await fs.readdir(inputDir)).filter((name) => extensions.has(path.extname(name).toLowerCase()));
} catch (error) {
  if (error.code === "ENOENT") throw new Error(`原图目录不存在：${inputDir}`);
  throw error;
}
if (!names.length) throw new Error(`原图目录中没有可处理的图片：${inputDir}`);

await fs.mkdir(outputDir, { recursive: true });
const manifest = [];
const bases = new Set();

for (const name of names.sort()) {
  const source = path.join(inputDir, name);
  const base = path.basename(name, path.extname(name)).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  if (!base) throw new Error(`${name}: 文件名至少需要一个 ASCII 字母或数字`);
  if (bases.has(base)) throw new Error(`${name}: 规范化后的文件名 ${base} 重复`);
  bases.add(base);

  const image = sharp(source).rotate().resize({ width: 2000, height: 2000, fit: "inside", withoutEnlargement: true });
  const webpName = `${base}.webp`;
  const avifName = `${base}.avif`;
  const thumbName = `${base}-thumb.webp`;
  const webp = await image.clone().webp({ quality: 82 }).toFile(path.join(outputDir, webpName));
  await image.clone().avif({ quality: 55 }).toFile(path.join(outputDir, avifName));
  await sharp(source).rotate().resize({ width: 640, height: 640, fit: "inside", withoutEnlargement: true }).webp({ quality: 78 }).toFile(path.join(outputDir, thumbName));

  manifest.push({
    src: `/gallery/${webpName}`,
    avif: `/gallery/${avifName}`,
    thumbnail: `/gallery/${thumbName}`,
    width: webp.width,
    height: webp.height,
    alt: "请填写准确的图片描述",
  });
}

await fs.writeFile(path.join(outputDir, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`已处理 ${manifest.length} 张图片：剥离元数据，并生成 WebP、AVIF、缩略图和 manifest.json`);
