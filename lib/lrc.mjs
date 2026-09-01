/** @typedef {{ time: number; text: string }} LyricLine */

/**
 * 解析常见 LRC 时间戳；同一行有多个时间戳时会展开为多行。
 * @param {string} source
 * @returns {LyricLine[]}
 */
export function parseLrc(source) {
  const lines = [];
  for (const raw of source.split(/\r?\n/)) {
    const stamps = [...raw.matchAll(/\[(\d{1,3}):(\d{2})(?:[.:](\d{1,3}))?\]/g)];
    const text = raw.replace(/\[[^\]]+\]/g, "").trim();
    if (!text) continue;
    for (const stamp of stamps) {
      const fraction = stamp[3] ? Number(`0.${stamp[3]}`) : 0;
      lines.push({ time: Number(stamp[1]) * 60 + Number(stamp[2]) + fraction, text });
    }
  }
  return lines.sort((a, b) => a.time - b.time);
}
