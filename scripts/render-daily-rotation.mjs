import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const DAY_MS = 86_400_000;
const root = fileURLToPath(new URL("../", import.meta.url));

export function rotationIndex(date, count) {
  if (!Number.isInteger(count) || count < 1) {
    throw new Error("Rotation requires at least one track");
  }

  return Math.floor(date.getTime() / DAY_MS) % count;
}

export function escapeXml(value) {
  return value.replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&apos;",
      })[character],
  );
}

export function renderCard(track, theme) {
  const dark = theme === "dark";
  const foreground = dark ? "#f0f6fc" : "#1f2328";
  const muted = dark ? "#8b949e" : "#59636e";
  const border = dark ? "#30363d" : "#d0d7de";
  const artist = escapeXml(track.artist);
  const title = escapeXml(track.track);
  const accent = escapeXml(track.accent);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="720" height="164" viewBox="0 0 720 164" role="img" aria-labelledby="title desc">
  <title id="title">${title} by ${artist}</title>
  <desc id="desc">Today&apos;s selection from Idan&apos;s daily music rotation.</desc>
  <rect x="1" y="1" width="718" height="162" rx="7" fill="none" stroke="${border}"/>
  <g transform="translate(34 36)">
    <circle cx="45" cy="45" r="44" fill="none" stroke="${border}" stroke-width="2"/>
    <circle cx="45" cy="45" r="31" fill="none" stroke="${accent}" stroke-width="7"/>
    <circle cx="45" cy="45" r="7" fill="${accent}"/>
    <path d="M45 14a31 31 0 0 1 27 16" fill="none" stroke="${foreground}" stroke-linecap="round" stroke-width="2" opacity=".75"/>
  </g>
  <g font-family="-apple-system, BlinkMacSystemFont, Segoe UI, Helvetica, Arial, sans-serif">
    <text x="146" y="45" fill="${accent}" font-size="12" font-weight="700" letter-spacing="1.4">ON ROTATION</text>
    <text x="146" y="82" fill="${foreground}" font-size="24" font-weight="650">${title}</text>
    <text x="146" y="111" fill="${muted}" font-size="16">${artist}</text>
    <text x="146" y="137" fill="${muted}" font-size="12">A daily pick from Idan&apos;s rotation</text>
  </g>
  <g transform="translate(621 53)" fill="${accent}">
    <rect x="0" y="25" width="7" height="32" rx="3.5" opacity=".45"/>
    <rect x="14" y="9" width="7" height="48" rx="3.5" opacity=".65"/>
    <rect x="28" y="18" width="7" height="39" rx="3.5" opacity=".85"/>
    <rect x="42" y="0" width="7" height="57" rx="3.5"/>
  </g>
</svg>
`;
}

async function main() {
  const dateArgument = process.argv.find((argument) => argument.startsWith("--date="));
  const date = dateArgument
    ? new Date(`${dateArgument.slice("--date=".length)}T00:00:00.000Z`)
    : new Date();

  if (Number.isNaN(date.getTime())) {
    throw new Error("Expected --date=YYYY-MM-DD");
  }

  const tracks = JSON.parse(
    await readFile(`${root}/data/daily-rotation.json`, "utf8"),
  );
  const track = tracks[rotationIndex(date, tracks.length)];

  await Promise.all(
    ["dark", "light"].map((theme) =>
      writeFile(
        `${root}/assets/daily-rotation-${theme}.svg`,
        renderCard(track, theme),
      ),
    ),
  );

  console.log(`${date.toISOString().slice(0, 10)}: ${track.track} — ${track.artist}`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await main();
}
