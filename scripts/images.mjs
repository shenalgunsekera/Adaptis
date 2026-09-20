/* ============================================================================
   Image preparation.

   Two jobs, both run once whenever the photography changes:

   1. Re-encode the sources. They arrived at up to 900KB, which is far more
      than any layout on the site uses. Capped at 1800px wide and re-encoded
      as progressive JPEG, which the image optimiser then derives AVIF and
      WebP from at request time.

   2. Emit a blur placeholder per image into src/content/blur.json — a 16px
      thumbnail as a data URI. It is what the page paints while the real
      photograph is still arriving, so no box is ever empty and nothing
      reflows when it lands.

     npm run images
   ========================================================================= */

import { readdir, readFile, writeFile, stat } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const DIR = "public/images";
const OUT = "src/content/blur.json";
const MAX_WIDTH = 1800;
const QUALITY = 68;

const files = (await readdir(DIR)).filter((f) => /\.(jpe?g|png|webp|avif)$/i.test(f));
const blur = {};
let before = 0;
let after = 0;

for (const file of files.sort()) {
  const full = path.join(DIR, file);
  before += (await stat(full)).size;

  const input = await readFile(full);
  const image = sharp(input);
  const meta = await image.metadata();

  // 1. Re-encode in place when the source is larger than the site can use.
  if ((meta.width ?? 0) > MAX_WIDTH || /\.jpe?g$/i.test(file)) {
    const out = await sharp(input)
      .resize({ width: Math.min(meta.width ?? MAX_WIDTH, MAX_WIDTH), withoutEnlargement: true })
      .jpeg({ quality: QUALITY, progressive: true, mozjpeg: true })
      .toBuffer();
    if (out.length < input.length) await writeFile(full, out);
  }

  after += (await stat(full)).size;

  // 2. The placeholder.
  const thumb = await sharp(await readFile(full))
    .resize(16, null, { fit: "inside" })
    .jpeg({ quality: 40 })
    .toBuffer();
  blur[`/images/${file}`] = `data:image/jpeg;base64,${thumb.toString("base64")}`;
}

await writeFile(OUT, JSON.stringify(blur, null, 2) + "\n");

const kb = (n) => (n / 1024).toFixed(0) + "KB";
console.log(`${files.length} images`);
console.log(`  source weight  ${kb(before)} -> ${kb(after)}  (${Math.round((1 - after / before) * 100)}% smaller)`);
console.log(`  placeholders   ${OUT}`);
