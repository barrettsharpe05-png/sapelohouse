import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const image = path.join(
  root,
  "public",
  "sapelo-house-webp-seo",
  "images",
  "sapelo-river-golden-sunset-dock-coastal-georgia.webp"
);
const output = path.join(root, "public", "og", "sapelo-house-sunset.jpg");
const overlay = Buffer.from(`<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="shade" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#07120d" stop-opacity="0.72"/>
      <stop offset="0.46" stop-color="#07120d" stop-opacity="0.12"/>
      <stop offset="1" stop-color="#07120d" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#shade)"/>
  <text x="68" y="112" fill="#fffdf7" font-family="Georgia, serif" font-size="70" font-weight="700">Sapelo House</text>
  <text x="72" y="162" fill="#f6ead7" font-family="Georgia, serif" font-size="28">A Different Pace of Coastal Georgia</text>
  <text x="74" y="204" fill="#f0d29d" font-family="Arial, sans-serif" font-size="15" font-weight="700" letter-spacing="2.5">THE SAPELO RIVER  &#8226;  GEORGIA</text>
</svg>`);

await sharp(image)
  .rotate()
  .resize(1200, 630, { fit: "cover", position: "attention" })
  .composite([{ input: overlay }])
  .jpeg({ quality: 84, chromaSubsampling: "4:2:0", mozjpeg: true })
  .toFile(output);

console.log(`Generated ${path.relative(root, output)} at 1200x630.`);
