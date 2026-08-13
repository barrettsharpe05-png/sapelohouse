import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const image = path.join(
  root,
  "public",
  "sapelo-house-webp-seo",
  "images",
  "sapelo-house-sapelo-river-view-live-oaks-townsend-georgia.webp"
);
const output = path.join(root, "public", "og", "sapelo-house.jpg");
const overlay = Buffer.from(`<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="shade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#07120d" stop-opacity="0"/>
      <stop offset="0.48" stop-color="#07120d" stop-opacity="0.08"/>
      <stop offset="1" stop-color="#07120d" stop-opacity="0.9"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#shade)"/>
  <text x="72" y="462" fill="#fffdf7" font-family="serif" font-size="78" font-weight="700">Sapelo House</text>
  <text x="76" y="516" fill="#f6ead7" font-family="serif" font-size="31">A Different Pace of Coastal Georgia</text>
  <text x="78" y="566" fill="#e5c78f" font-family="sans-serif" font-size="17" font-weight="700" letter-spacing="3">SAPELO RIVER | GEORGIA COAST</text>
</svg>`);

await sharp(image)
  .rotate()
  .resize(1200, 630, { fit: "cover", position: "centre" })
  .composite([{ input: overlay }])
  .jpeg({ quality: 84, chromaSubsampling: "4:2:0", mozjpeg: true })
  .toFile(output);

console.log(`Generated ${path.relative(root, output)} at 1200x630.`);
