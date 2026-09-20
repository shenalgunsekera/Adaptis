import puppeteer from "puppeteer-core";

/* Collects every background and text colour actually painted across the site
   and classifies each as canonical Rise v2, a documented [ext] derivation, or
   unaccounted for. */

const CANON = {
  "#33332C": "Ink (brand dark)",
  "#FAD758": "Naples",
  "#FCE9A6": "Naples light",
  "#F1B393": "Apricot",
  "#09324A": "Halite",
  "#1B6F81": "Billabong",
  "#AED0C9": "Cassiopeia",
  "#FFFDF9": "Card",
  "#FCFBFA": "Page",
  "#F5F3F1": "Ivory",
  "#EDEBE9": "Tint",
  "#D8D6D4": "Hairline",
  "#B1AEAC": "Quiet",
  "#6B6967": "Secondary",
  "#FFFFFF": "White (product ground)",
};

const EXT = {
  "#2B2B25": "[ext] --ink-recessed",
  "#3C3C34": "[ext] --ink-raised",
  "#45453C": "[ext] --ink-hover",
  "#1E1E19": "[ext] --ink-bar",
  "#5B5955": "[ext] --text-secondary-on-fill",
  "#22221D": "[ext] btn--ink hover",
  "#C4DCD7": "[ext] btn--halite hover",
};

const PAGES = ["", "what-we-do", "what-we-do/capital", "who-we-serve", "customer-stories", "about", "contact"];

const hex = (rgb) => {
  const m = rgb.match(/\d+/g);
  if (!m) return null;
  const [r, g, b] = m.map(Number);
  const a = m.length > 3 ? Number(m[3]) : 1;
  if (a === 0) return null;
  return "#" + [r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("").toUpperCase();
};

const browser = await puppeteer.launch({
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  headless: true, args: ["--no-sandbox"],
});

const seen = new Map();

for (const slug of PAGES) {
  const p = await browser.newPage();
  await p.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }]);
  await p.setViewport({ width: 1440, height: 900 });
  await p.goto(`http://localhost:3000/${slug}`, { waitUntil: "load", timeout: 30000 });
  await p.evaluate(() => document.fonts.ready).catch(() => {});
  await new Promise((r) => setTimeout(r, 400));

  const found = await p.evaluate(() => {
    const out = [];
    for (const el of document.querySelectorAll("body *")) {
      const cs = getComputedStyle(el);
      if (cs.display === "none") continue;
      const r = el.getBoundingClientRect();
      // Only colours that actually cover meaningful area.
      if (r.width * r.height < 400) continue;
      out.push(["bg", cs.backgroundColor]);
      if (el.textContent && el.textContent.trim() && el.children.length === 0) {
        out.push(["text", cs.color]);
      }
      if (cs.borderTopWidth !== "0px") out.push(["border", cs.borderTopColor]);
    }
    return out;
  });

  for (const [kind, raw] of found) {
    const h = hex(raw);
    if (!h) continue;
    const key = h + "|" + kind;
    seen.set(key, (seen.get(key) ?? 0) + 1);
  }
  await p.close();
}

await browser.close();

const rows = [...seen.entries()]
  .map(([k, n]) => {
    const [h, kind] = k.split("|");
    return { h, kind, n };
  })
  .sort((a, b) => b.n - a.n);

const unknown = [];
console.log("colour      uses   kind     classification");
console.log("--------------------------------------------------------");
const shown = new Set();
for (const r of rows) {
  if (shown.has(r.h + r.kind)) continue;
  shown.add(r.h + r.kind);
  const label = CANON[r.h] ?? EXT[r.h] ?? null;
  if (!label) unknown.push(r);
  console.log(
    r.h.padEnd(11),
    String(r.n).padStart(4),
    "  " + r.kind.padEnd(7),
    label ?? "UNACCOUNTED FOR"
  );
}

console.log(
  unknown.length === 0
    ? "\nEvery painted colour is canonical Rise v2 or a documented [ext] derivation."
    : `\n${unknown.length} colour(s) unaccounted for.`
);
