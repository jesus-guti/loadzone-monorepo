import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const size = Number(process.argv[2] ?? "512");
const outPath = process.argv[3];

if (!outPath) {
  throw new Error("Usage: node generate-loadzone-fallback-icon.mjs <size> <outPath>");
}

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 100 100">
  <defs>
    <radialGradient id="g" cx="34" cy="30" r="90" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#8fd4bc" />
      <stop offset="45%" stop-color="#2f7a62" />
      <stop offset="100%" stop-color="#14352c" />
    </radialGradient>
  </defs>
  <rect width="100" height="100" fill="url(#g)" />
  <text x="50" y="62" text-anchor="middle" font-family="ui-sans-serif, system-ui, sans-serif" font-size="36" font-weight="700" fill="#f4faf7">LZ</text>
</svg>`;

const png = await sharp(Buffer.from(svg)).resize(size, size).removeAlpha().png().toBuffer();
await mkdir(path.dirname(outPath), { recursive: true });
await writeFile(outPath, png);
