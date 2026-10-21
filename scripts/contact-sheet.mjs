import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = process.env.IMG_ROOT;
const out = process.env.OUT;
const files = (await fs.readdir(root))
  .filter((file) => /\.webp$/i.test(file))
  .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

const cols = 6;
const tileWidth = 300;
const tileHeight = 250;
const composites = [];

for (let index = 0; index < files.length; index += 1) {
  const file = files[index];
  const thumbnail = await sharp(path.join(root, file))
    .resize({ width: tileWidth - 24, height: tileHeight - 58, fit: "contain", background: { r: 245, g: 245, b: 245 } })
    .png()
    .toBuffer();
  const escaped = file.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
  const label = Buffer.from(`<svg width="${tileWidth}" height="${tileHeight}">
    <rect width="100%" height="100%" fill="white"/>
    <text x="8" y="20" font-family="Arial" font-size="16" font-weight="bold" fill="#111">#${String(index + 1).padStart(2, "0")}</text>
    <text x="8" y="242" font-family="Arial" font-size="11" fill="#111">${escaped}</text>
  </svg>`);
  const left = (index % cols) * tileWidth;
  const top = Math.floor(index / cols) * tileHeight;
  composites.push({ input: thumbnail, left: left + 12, top: top + 28 });
  composites.push({ input: label, left, top });
}

await sharp({
  create: {
    width: cols * tileWidth,
    height: Math.ceil(files.length / cols) * tileHeight,
    channels: 4,
    background: { r: 230, g: 230, b: 230, alpha: 1 },
  },
})
  .composite(composites)
  .webp({ quality: 80 })
  .toFile(out);

console.log(`Created ${out} for ${files.length} images`);
