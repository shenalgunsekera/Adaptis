import puppeteer from "puppeteer-core";

/* Compares what the live site actually renders against the canonical values
   in Adaptis_Rise_v2_Design_System/tokens/ and the build notes type scale. */

const CANON_COLOR = {
  "--brand-ink": "#33332C",
  "--brand-naples": "#FAD758",
  "--brand-naples-light": "#FCE9A6",
  "--brand-apricot": "#F1B393",
  "--brand-halite": "#09324A",
  "--brand-billabong": "#1B6F81",
  "--brand-cassiopeia": "#AED0C9",
  "--neutral-card": "#FFFDF9",
  "--neutral-page": "#FCFBFA",
  "--neutral-ivory": "#F5F3F1",
  "--neutral-tint": "#EDEBE9",
  "--neutral-hairline": "#D8D6D4",
  "--neutral-quiet": "#B1AEAC",
  "--neutral-secondary": "#6B6967",
};

// Build notes: "Four faces is the ceiling."
const CANON_FONT = {
  "--font-display": "Elms Sans",
  "--font-serif": "Source Serif 4",
  "--font-ui": "Geist",
  "--font-mono": "Geist Mono",
};

const b = await puppeteer.launch({
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  headless: true, args: ["--no-sandbox"],
});
const p = await b.newPage();
await p.setViewport({ width: 1440, height: 900 });
await p.goto("http://localhost:3000/", { waitUntil: "load" });
await p.evaluate(() => document.fonts.ready).catch(() => {});
await new Promise((r) => setTimeout(r, 1200));

const out = await p.evaluate((canonColor, canonFont) => {
  const root = getComputedStyle(document.documentElement);

  const colors = {};
  for (const k of Object.keys(canonColor)) colors[k] = root.getPropertyValue(k).trim();

  const fonts = {};
  for (const k of Object.keys(canonFont)) fonts[k] = root.getPropertyValue(k).trim();

  // What each key element is actually painted with.
  const sample = (sel, props) => {
    const el = document.querySelector(sel);
    if (!el) return null;
    const cs = getComputedStyle(el);
    const o = {};
    for (const pr of props) o[pr] = cs[pr];
    return o;
  };

  const TYPE = ["fontFamily", "fontSize", "fontWeight", "lineHeight", "letterSpacing", "color"];

  // Which of the four faces the browser actually resolved to.
  const resolved = {};
  for (const [label, sel] of [
    ["h1 (display)", ".h1-home"],
    ["h2 (serif)", ".h2"],
    ["body (ui)", ".hcard__body"],
    ["tag (mono)", ".hero__count"],
  ]) {
    const el = document.querySelector(sel);
    resolved[label] = el ? getComputedStyle(el).fontFamily : "not found";
  }

  // Is Elms Sans genuinely loaded, or silently falling back?
  const loaded = [...document.fonts].map((f) => `${f.family} ${f.weight} ${f.status}`);

  return {
    colors,
    fonts,
    resolved,
    loadedFaces: [...new Set(loaded)],
    heroH1: sample(".h1-home", TYPE),
    heroEm: sample(".h1-em", TYPE),
    h2: sample(".h2", TYPE),
    body: sample(".body", TYPE),
    eyebrow: sample(".eyebrow", TYPE),
    btn: sample(".btn--primary", [...TYPE, "backgroundColor", "paddingTop", "paddingLeft", "borderRadius"]),
    bodyBg: getComputedStyle(document.body).backgroundColor,
    headerBg: sample(".header__bar", ["backgroundColor"]),
  };
}, CANON_COLOR, CANON_FONT);

console.log("=== COLOUR TOKENS vs canonical ===");
let colorBad = 0;
for (const [k, want] of Object.entries(CANON_COLOR)) {
  const got = out.colors[k];
  const ok = got.toUpperCase() === want.toUpperCase();
  if (!ok) colorBad++;
  console.log(`${ok ? "ok  " : "DIFF"}  ${k.padEnd(24)} want ${want}  got ${got || "(missing)"}`);
}

console.log("\n=== FONT TOKENS vs canonical ===");
let fontBad = 0;
for (const [k, want] of Object.entries(CANON_FONT)) {
  const got = out.fonts[k];
  const ok = got.includes(want);
  if (!ok) fontBad++;
  console.log(`${ok ? "ok  " : "DIFF"}  ${k.padEnd(16)} expects "${want}"  got ${got}`);
}

console.log("\n=== WHAT ACTUALLY RENDERS ===");
for (const [k, v] of Object.entries(out.resolved)) console.log(`  ${k.padEnd(16)} ${v}`);

console.log("\n=== FACES THE BROWSER LOADED ===");
out.loadedFaces.forEach((f) => console.log("  " + f));

console.log("\n=== TYPE SCALE (build notes) ===");
const show = (label, o, want) => {
  if (!o) return console.log(`  ${label}: not found`);
  console.log(`  ${label.padEnd(12)} ${o.fontSize} / ${o.lineHeight}  w${o.fontWeight}  ls ${o.letterSpacing}`);
  if (want) console.log(`  ${"".padEnd(12)} build notes: ${want}`);
};
show("hero h1", out.heroH1, "clamp(32,5.4vw,56) / 1.06, -0.02em");
show("hero italic", out.heroEm);
show("h2", out.h2, "clamp(24,3.4vw,34) / 1.16");
show("body", out.body, "17px / 1.70");
show("eyebrow", out.eyebrow, "12px / 1.35, +0.09em");
show("button", out.btn, "15px / 1, padding 15/22, radius 8");
if (out.btn) console.log(`  button fill ${out.btn.backgroundColor}, pad ${out.btn.paddingTop}/${out.btn.paddingLeft}, radius ${out.btn.borderRadius}`);

console.log("\n=== GROUNDS ===");
console.log("  body background :", out.bodyBg);
console.log("  header bar      :", out.headerBg?.backgroundColor);

console.log(`\n${colorBad === 0 ? "All colour tokens match canonical." : colorBad + " colour token(s) differ."}`);
console.log(`${fontBad === 0 ? "All four faces match canonical." : fontBad + " font token(s) differ."}`);

await b.close();
