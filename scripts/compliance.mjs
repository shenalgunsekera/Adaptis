/* ============================================================================
   Design-system compliance.

   Checks the rendered site against the rules stated across
   Adaptis_Rise_v2_Design_System: tokens/, guidelines/ and components/.
   Everything here quotes a rule that exists in that folder.

     npm run build && npm start &
     npm run compliance
   ========================================================================= */

import puppeteer from "puppeteer-core";

const BASE = process.env.BASE ?? "http://localhost:3000";
const CHROME =
  process.env.CHROME ?? "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

const SITE = [
  "", "what-we-do", "what-we-do/building-record", "what-we-do/assessments",
  "what-we-do/capital", "what-we-do/managed-services", "what-we-do/reporting",
  "who-we-serve", "customer-stories", "about", "contact",
];
const PRODUCT = ["admin"];

/* Marketing radii: controls 8, cards 10, insets 12, module grammar 0, plus
   50% for the round carousel controls. Product is square: radius 0. */
const MARKETING_RADII = new Set([0, 8, 10, 12]);
const SPACING = new Set([0, 1, 2, 3, 4, 6, 8, 12, 16, 24, 32, 48, 64]);
const FACES = ["Elms Sans", "Source Serif 4", "Geist", "Geist Mono"];

let fails = 0;
const fail = (page, rule, detail) => {
  console.log(`   FAIL [${rule}] ${detail}`);
  fails++;
};

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});

async function scan(slug, product) {
  const page = await browser.newPage();
  await page.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }]);
  await page.setViewport({ width: 1440, height: 1000 });
  await page.goto(`${BASE}/${slug}`, { waitUntil: "load", timeout: 30000 });
  await page.evaluate(() => document.fonts.ready).catch(() => {});
  await new Promise((r) => setTimeout(r, 350));

  const r = await page.evaluate((isProduct, RADII, SPACE, OK_FAM) => {
    const MARKETING_RADII = new Set(RADII);
    const SPACING = new Set(SPACE);
    const out = {
      shadows: [], gradients: [], rotations: [], radii: [], spacing: [],
      faces: [], caps: [], numerals: [], productSurfaces: [], tinyRadius: [],
    };
    const seen = (arr, v) => { if (!arr.includes(v) && arr.length < 40) arr.push(v); };
    const name = (el) =>
      el.tagName.toLowerCase() + (typeof el.className === "string" && el.className ? "." + el.className.split(" ")[0] : "");

    for (const el of document.querySelectorAll("body *")) {
      const cs = getComputedStyle(el);
      if (cs.display === "none") continue;
      const box = el.getBoundingClientRect();
      const visible = box.width > 0 && box.height > 0;

      // "No shadows, no gradients, no depth effects, no rotation."
      if (cs.boxShadow && cs.boxShadow !== "none") seen(out.shadows, `${name(el)} ${cs.boxShadow.slice(0, 40)}`);
      if (cs.textShadow && cs.textShadow !== "none") seen(out.shadows, `${name(el)} text-shadow`);
      for (const prop of ["backgroundImage", "borderImageSource"]) {
        const v = cs[prop];
        if (v && v.includes("gradient") && !v.includes("mask")) seen(out.gradients, `${name(el)} ${prop}`);
      }
      const tr = cs.transform;
      if (tr && tr !== "none" && !tr.startsWith("matrix(1,") && tr.startsWith("matrix")) {
        const m = tr.match(/matrix\(([^)]+)\)/);
        if (m) {
          const [a, b] = m[1].split(",").map(Number);
          // b !== 0 with a != 1 means a rotation or skew rather than a scale.
          if (Math.abs(b) > 0.001) seen(out.rotations, `${name(el)} ${tr.slice(0, 32)}`);
        }
      }

      if (!visible) continue;

      // Radii.
      for (const corner of ["borderTopLeftRadius", "borderTopRightRadius", "borderBottomLeftRadius", "borderBottomRightRadius"]) {
        const raw = cs[corner];
        if (!raw || raw === "0px") continue;
        if (raw.includes("%")) continue; // circles and the 0.35 module ratio
        const px = Math.round(parseFloat(raw));
        if (isProduct) {
          if (px !== 0) seen(out.radii, `${name(el)} ${px}px (product is square)`);
        } else if (!MARKETING_RADII.has(px)) {
          seen(out.radii, `${name(el)} ${px}px`);
        }
      }

      // "Four faces is the ceiling."
      const fam = cs.fontFamily.split(",")[0].replace(/["']/g, "").trim();
      if (fam && !OK_FAM.includes(fam)) {
        seen(out.faces, fam);
      }

      // "Sentence case throughout. No all-caps."
      if (cs.textTransform === "uppercase") seen(out.caps, name(el));

      // "tabular-nums on every numeric column."
      if (el.children.length === 0) {
        const t = (el.textContent || "").trim();
        const numericCell = /^[$(]?[\d][\d,. ]*\)?%?$/.test(t) && /\d/.test(t) && t.length > 1;
        if (numericCell && !cs.fontVariantNumeric.includes("tabular-nums")) {
          seen(out.numerals, `${name(el)} "${t.slice(0, 18)}"`);
        }
      }

      // Product: "Card and Ivory never appear in product."
      if (isProduct) {
        const bg = cs.backgroundColor;
        if (bg.includes("255, 253, 249") || bg.includes("245, 243, 241")) {
          seen(out.productSurfaces, `${name(el)} uses Card/Ivory as a surface`);
        }
      }
    }
    return out;
  }, product, [...MARKETING_RADII], [...SPACING],
     ["ui-monospace", "system-ui", "-apple-system", "Georgia", "serif", "sans-serif", "monospace", "inherit"]);

  const label = product ? `/${slug} (product)` : `/${slug}`;
  const problems =
    r.shadows.length + r.gradients.length + r.rotations.length + r.radii.length +
    r.caps.length + r.numerals.length + r.productSurfaces.length +
    r.faces.filter((f) => !FACES.includes(f)).length;

  if (problems === 0) {
    console.log(`${label}  ok`);
  } else {
    console.log(label);
    r.shadows.forEach((d) => fail(slug, "no shadows", d));
    r.gradients.forEach((d) => fail(slug, "no gradients", d));
    r.rotations.forEach((d) => fail(slug, "no rotation", d));
    r.radii.forEach((d) => fail(slug, "radii", d));
    r.caps.forEach((d) => fail(slug, "sentence case", d));
    r.numerals.forEach((d) => fail(slug, "tabular-nums", d));
    r.productSurfaces.forEach((d) => fail(slug, "product surfaces", d));
    r.faces.filter((f) => !FACES.includes(f)).forEach((d) => fail(slug, "four faces", d));
  }

  await page.close();
}

console.log("=== Marketing surfaces ===");
for (const slug of SITE) await scan(slug, false);
console.log("\n=== Product surfaces ===");
for (const slug of PRODUCT) await scan(slug, true);

await browser.close();
console.log(fails === 0 ? "\nCompliance passed." : `\nCompliance found ${fails} problem(s).`);
process.exit(fails === 0 ? 0 : 1);
