/* ============================================================================
   Spacing lint.

   tokens/spacing.css sets the scale: 4 8 12 16 24 32 48 64, on a 4px base.

   This reads the source rather than computed styles, because a clamp()
   resolves to whatever the viewport gives it and can never sit on a scale.
   Only the literal steps an author typed are held to it.

   Exempt:
     - anything inside clamp(), calc() or var()
     - hairline and sub-pixel values (1, 2, 3px) used for rules and edges
     - the control padding the build notes specify outright:
       "Button | Geist 500 · 15px / 1 | padding 15px 22px, radius 8px"

     npm run spacing
   ========================================================================= */

import { readFileSync } from "node:fs";

const SCALE = new Set([0, 1, 2, 3, 4, 8, 12, 16, 24, 32, 48, 64]);
const SPECIFIED = new Set([15, 22]);
const FILES = ["src/styles/globals.css", "src/styles/admin.css"];

const PROP =
  /(?:^|[;{\s])(padding|margin|gap|row-gap|column-gap|padding-block|padding-inline|margin-block|margin-inline)(?:-top|-bottom|-left|-right)?\s*:\s*([^;}]+)/;

let fails = 0;

for (const file of FILES) {
  const lines = readFileSync(file, "utf8").split("\n");

  lines.forEach((line, i) => {
    if (/clamp\(|calc\(|var\(/.test(line)) return;
    const m = line.match(PROP);
    if (!m) return;

    for (const tok of m[2].trim().split(/\s+/)) {
      if (!/^-?\d+(\.\d+)?px$/.test(tok)) continue;
      const v = Math.abs(parseFloat(tok));
      if (SCALE.has(v) || SPECIFIED.has(v)) continue;
      console.log(`   FAIL ${file}:${i + 1}  ${tok}  ${line.trim().slice(0, 64)}`);
      fails++;
    }
  });
}

console.log(
  fails === 0
    ? "\nSpacing: every literal step is on the 4px scale."
    : `\nSpacing: ${fails} off-scale value(s).`
);
process.exit(fails === 0 ? 0 : 1);
