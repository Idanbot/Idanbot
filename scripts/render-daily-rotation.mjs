import { mkdir, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const DAY_MS = 86_400_000;
const root = fileURLToPath(new URL("../", import.meta.url));

export function rotationIndex(date, count) {
  if (!Number.isInteger(count) || count < 1) throw new Error("Rotation requires at least one track");
  return Math.floor(date.getTime() / DAY_MS) % count;
}

export function escapeXml(value) {
  return value.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" })[character]);
}

export function fitTitle(value) {
  const title = value.length > 46 ? `${value.slice(0, 43)}...` : value;
  const size = title.length > 34 ? 18 : title.length > 24 ? 21 : 24;
  return { title, size };
}

export function renderCard(track, theme) {
  const dark = theme === "dark";
  const foreground = dark ? "#f0f6fc" : "#1f2328";
  const muted = dark ? "#8b949e" : "#59636e";
  const border = dark ? "#30363d" : "#d0d7de";
  const panel = dark ? "#161b22" : "#f6f8fa";
  const artist = escapeXml(track.artist);
  const fitted = fitTitle(track.track);
  const title = escapeXml(fitted.title);
  const accent = escapeXml(track.accent);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="720" height="154" viewBox="0 0 720 154" role="img" aria-labelledby="title desc">
  <title id="title">${escapeXml(track.track)} by ${artist}</title>
  <desc id="desc">Today&apos;s selection from Idan&apos;s music rotation.</desc>
  <rect x="1" y="1" width="718" height="152" rx="4" fill="none" stroke="${border}"/>
  <rect x="18" y="18" width="8" height="118" rx="4" fill="${accent}"/>
  <g font-family="ui-monospace, SFMono-Regular, Menlo, Consolas, monospace">
    <text x="48" y="41" fill="${accent}" font-size="11" font-weight="700">ROTATION / DAILY</text>
    <text x="48" y="78" fill="${foreground}" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, Helvetica, Arial, sans-serif" font-size="${fitted.size}" font-weight="650">${title}</text>
    <text x="48" y="105" fill="${muted}" font-size="14">${artist}</text>
    <text x="48" y="129" fill="${muted}" font-size="10">STATUS  SELECTED</text>
  </g>
  <g transform="translate(570 31)">
    <rect width="122" height="92" rx="4" fill="${panel}" stroke="${border}"/>
    <path d="M15 63h14l8-22 13 39 10-52 12 35h35" fill="none" stroke="${accent}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="107" cy="63" r="4" fill="${accent}"/>
  </g>
</svg>\n`;
}

async function main() {
  const dateArgument = process.argv.find((argument) => argument.startsWith("--date="));
  const outputArgument = process.argv.find((argument) => argument.startsWith("--output-dir="));
  const date = dateArgument ? new Date(`${dateArgument.slice(7)}T00:00:00.000Z`) : new Date();
  if (Number.isNaN(date.getTime())) throw new Error("Expected --date=YYYY-MM-DD");
  const outputDir = outputArgument ? outputArgument.slice(13) : `${root}/assets`;
  const tracks = JSON.parse(await readFile(`${root}/data/daily-rotation.json`, "utf8"));
  const track = tracks[rotationIndex(date, tracks.length)];
  await mkdir(outputDir, { recursive: true });
  await Promise.all(["dark", "light"].map((theme) => writeFile(`${outputDir}/daily-rotation-${theme}.svg`, renderCard(track, theme))));
  console.log(`${date.toISOString().slice(0, 10)}: ${track.track} - ${track.artist}`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) await main();
