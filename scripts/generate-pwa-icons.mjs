// Run manually when the brand mark changes. Generated PNG/ICO assets are committed.
import sharp from "sharp";
import { readFile, writeFile, mkdir } from "node:fs/promises";
const root = new URL("../public/icons/", import.meta.url);
await mkdir(root, { recursive: true });
const source = await readFile(new URL("thunderfix.svg", root), "utf8");
for (const size of [192, 512]) {
  await writeFile(
    new URL(`icon-${size}.png`, root),
    await sharp(Buffer.from(source)).resize(size, size).png().toBuffer(),
  );
}
// Full bleed background; the lightning stays inside the maskable safe circle.
const maskable = source.replace('rx="108"', 'rx="0"');
await writeFile(
  new URL("maskable-512.png", root),
  await sharp(Buffer.from(maskable)).png().toBuffer(),
);
await writeFile(
  new URL("apple-touch-icon.png", root),
  await sharp(Buffer.from(maskable)).resize(180, 180).png().toBuffer(),
);
const png = await sharp(Buffer.from(source)).resize(32, 32).png().toBuffer();
const ico = Buffer.alloc(22);
ico.writeUInt16LE(1, 2);
ico.writeUInt16LE(1, 4);
ico[6] = 32;
ico[7] = 32;
ico.writeUInt16LE(1, 10);
ico.writeUInt16LE(32, 12);
ico.writeUInt32LE(png.length, 14);
ico.writeUInt32LE(22, 18);
await writeFile(
  new URL("../app/favicon.ico", import.meta.url),
  Buffer.concat([ico, png]),
);
