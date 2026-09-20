/* ============================================================================
   Layout and accessibility audit.

   Loads every page in a real browser at phone, tablet and desktop widths and
   checks the things the handoff says must hold:

     - no horizontal overflow at any width
     - the side gutter never drops below 20px
     - no tap target under 24px
     - no text under 11.5px
     - every text node at WCAG 2.1 AA against its own painted ground
     - one h1 per page, headings in order
     - a working skip link, and an accessible name on the logo
     - alt text on every image
     - one Naples form per page
     - a light section between the last dark one and the Halite footer
     - no gradients, no shadows
     - sentence case, with no all-caps runs
     - a title, a meta description and a canonical URL

   Usage, against a running build:

     npm run build && npm start &
     node scripts/audit.mjs

   Set BASE to point somewhere else, and CHROME if the browser is not at the
   default Windows location.
   ========================================================================= */

import puppeteer from "puppeteer-core";

const BASE = process.env.BASE ?? "http://localhost:3000";
const CHROME =
  process.env.CHROME ?? "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

const PAGES = [
  "",
  "what-we-do",
  "what-we-do/building-record",
  "what-we-do/assessments",
  "what-we-do/capital",
  "what-we-do/managed-services",
  "what-we-do/reporting",
  "who-we-serve",
  "customer-stories",
  "about",
  "contact",
  "admin",
];

const WIDTHS = [320, 360, 390, 768, 1024, 1440];

let failures = 0;
const fail = (m) => {
  console.log("   FAIL " + m);
  failures++;
};

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});

for (const slug of PAGES) {
  console.log(`\n/${slug}`);
  const url = `${BASE}/${slug}`;

  /* --- Markup checks, once per page ------------------------------------- */
  if (slug !== "admin") {
    const raw = await fetch(url).then((r) => r.text());
    // The inlined RSC payload repeats class names and would double-count.
    const html = raw.replace(/<script[\s\S]*?<\/script>/g, "");

    const h1s = (html.match(/<h1[\s>]/g) || []).length;
    if (h1s !== 1) fail(`${h1s} h1 elements; there must be exactly one`);

    const seq = [...html.matchAll(/<h([1-4])[\s>]/g)].map((m) => Number(m[1]));
    let prev = 0;
    for (const lvl of seq) {
      if (prev && lvl > prev + 1) {
        fail(`heading level jumps h${prev} to h${lvl}`);
        break;
      }
      prev = lvl;
    }

    if (!html.includes('class="skip"')) fail("no skip link");
    if (!html.includes("on-halite footer")) fail("no Halite footer");
    if (!/aria-label="Adaptis, home"/.test(html)) fail("the logo link has no accessible name");

    // Every device that paints Naples at size, not just btn--primary.
    const naples =
      (html.match(/btn--primary/g) || []).length +
      (html.match(/band--naples/g) || []).length;
    if (naples !== 1)
      fail(`${naples} Naples form(s); the brand allows exactly one per page`);

    const grounds = [...html.matchAll(/class="(on-ink|on-card|on-page|on-halite)[^"]*"/g)].map(
      (m) => m[1]
    );
    const footerAt = grounds.lastIndexOf("on-halite");
    if (footerAt > 0 && grounds[footerAt - 1] === "on-ink") {
      fail("an Ink section sits directly above the Halite footer; they must not touch");
    }

    const imgs = [...html.matchAll(/<img\b[^>]*>/g)].map((m) => m[0]);
    const noAlt = imgs.filter((t) => !/\balt=/.test(t)).length;
    if (noAlt) fail(`${noAlt} image(s) without alt text`);

    if (/linear-gradient|radial-gradient/.test(html)) fail("a gradient is present");
    if (/box-shadow\s*:\s*(?!none)/.test(html)) fail("a shadow is present");

    const text = html.replace(/<[^>]+>/g, " ");
    const caps = text.match(/\b[A-Z]{4,}\b(\s+\b[A-Z]{4,}\b){2,}/);
    if (caps) fail(`all-caps run: "${caps[0].slice(0, 40)}"`);

    if (!/<title>/.test(html)) fail("no title");
    if (!/name="description"/.test(html)) fail("no meta description");
    if (!/rel="canonical"/.test(html)) fail("no canonical URL");
  }

  /* --- Layout checks, at each width -------------------------------------- */
  for (const w of WIDTHS) {
    const page = await browser.newPage();
    // Reduced motion: no loader curtain, no pending reveals, so every
    // measurement is of the settled layout.
    await page.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }]);
    await page.setViewport({ width: w, height: 900 });
    await page.goto(url, { waitUntil: "load", timeout: 30000 });
    await page.evaluate(() => document.fonts.ready).catch(() => {});
    await new Promise((r) => setTimeout(r, 150));

    const r = await page.evaluate((vw) => {
      const over = [];
      for (const el of document.querySelectorAll("body *")) {
        const cs = getComputedStyle(el);
        if (cs.display === "none" || cs.visibility === "hidden") continue;
        const b = el.getBoundingClientRect();
        if (b.width === 0 && b.height === 0) continue;
        // Deliberately parked off-screen: the honeypot, and sr-only clipping.
        if (b.left < -1000) continue;
        let p = el.parentElement;
        let scrollable = false;
        while (p && p !== document.body) {
          const ox = getComputedStyle(p).overflowX;
          if (ox === "auto" || ox === "scroll" || ox === "hidden") {
            scrollable = true;
            break;
          }
          p = p.parentElement;
        }
        if (scrollable) continue;
        if (b.right > vw + 1 || b.left < -1) {
          over.push(`${el.tagName.toLowerCase()}.${String(el.className).slice(0, 40)}`);
        }
      }

      const wrap = document.querySelector("main .wrap") || document.querySelector(".wrap");
      const gutter = wrap
        ? Math.round(
            wrap.getBoundingClientRect().left + parseFloat(getComputedStyle(wrap).paddingLeft)
          )
        : null;

      const small = [];
      for (const el of document.querySelectorAll("a, button, input, select, textarea")) {
        const cs = getComputedStyle(el);
        if (cs.display === "none" || cs.visibility === "hidden") continue;
        const b = el.getBoundingClientRect();
        if (b.width === 0 || b.height === 0) continue;
        // Visually hidden by design, e.g. the skip link until it takes focus.
        if (cs.clipPath && cs.clipPath !== "none") continue;
        if (b.height < 24 || b.width < 24) {
          small.push(`${el.tagName.toLowerCase()} ${Math.round(b.width)}x${Math.round(b.height)}`);
        }
      }

      /* Text contrast, measured against the element's own painted ground
         rather than against the section's. A tile whose fill belongs to one
         ground while its text belongs to another is exactly the bug this
         catches. WCAG 2.1 AA: 4.5:1 normal, 3:1 at 18.66px+ or bold 14px+. */
      const lum = (rgb) => {
        const [r, g, bl] = rgb.map((v) => {
          const c = v / 255;
          return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
        });
        return 0.2126 * r + 0.7152 * g + 0.0722 * bl;
      };
      const parse = (c) => {
        const m = c.match(/rgba?(([^)]+))/);
        if (!m) return null;
        const parts = m[1].split(",").map((n) => parseFloat(n));
        return { rgb: parts.slice(0, 3), a: parts.length > 3 ? parts[3] : 1 };
      };
      const groundOf = (el) => {
        let n = el;
        while (n && n !== document.documentElement) {
          const c = parse(getComputedStyle(n).backgroundColor);
          if (c && c.a > 0.85) return c.rgb;
          n = n.parentElement;
        }
        return [51, 51, 44];
      };

      const lowContrast = [];
      for (const el of document.querySelectorAll("p, li, span, a, h1, h2, h3, h4, td, th, label, div")) {
        const txt = el.textContent?.trim();
        if (!txt || el.children.length) continue;
        const cs = getComputedStyle(el);
        if (cs.display === "none" || cs.visibility === "hidden") continue;
        if (cs.clipPath && cs.clipPath !== "none") continue;
        const r = el.getBoundingClientRect();
        if (r.width === 0 || r.height === 0) continue;
        const fg = parse(cs.color);
        if (!fg || fg.a < 0.95) continue;
        const bg = groundOf(el);
        const l1 = lum(fg.rgb), l2 = lum(bg);
        const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
        const size = parseFloat(cs.fontSize);
        const bold = parseInt(cs.fontWeight, 10) >= 700;
        const need = size >= 18.66 || (bold && size >= 14) ? 3 : 4.5;
        if (ratio < need) {
          lowContrast.push(`"${txt.slice(0, 26)}" ${ratio.toFixed(2)}:1 (needs ${need})`);
        }
      }

      const tiny = [];
      for (const el of document.querySelectorAll("p, span, li, a, td, th, label")) {
        if (!el.textContent?.trim() || el.children.length) continue;
        const fs = parseFloat(getComputedStyle(el).fontSize);
        if (fs && fs < 11.5) tiny.push(`${fs}px`);
      }

      return {
        docW: document.documentElement.scrollWidth,
        over: over.slice(0, 5),
        overCount: over.length,
        gutter,
        small: small.slice(0, 4),
        smallCount: small.length,
        tinyCount: tiny.length,
        lowContrast: lowContrast.slice(0, 4),
        lowContrastCount: lowContrast.length,
      };
    }, w);

    const problems = [];
    if (r.docW > w + 1) problems.push(`horizontal overflow: ${r.docW}px at ${w}px`);
    if (r.overCount) problems.push(`${r.overCount} element(s) past the edge: ${r.over.join(" | ")}`);
    if (r.gutter !== null && w <= 480 && r.gutter < 20) problems.push(`gutter ${r.gutter}px, minimum 20px`);
    if (r.smallCount) problems.push(`${r.smallCount} tap target(s) under 24px: ${r.small.join(" | ")}`);
    if (r.tinyCount) problems.push(`${r.tinyCount} text node(s) under 11.5px`);
    if (r.lowContrastCount)
      problems.push(`${r.lowContrastCount} text node(s) under AA: ${r.lowContrast.join(" | ")}`);

    if (problems.length) {
      console.log(`  ${w}px`);
      problems.forEach(fail);
    } else {
      console.log(`  ${w}px  ok${r.gutter === null ? "" : `  (gutter ${r.gutter}px)`}`);
    }

    await page.close();
  }
}

await browser.close();

console.log(
  failures === 0 ? "\n\nAudit passed." : `\n\nAudit found ${failures} problem(s).`
);
process.exit(failures === 0 ? 0 : 1);
