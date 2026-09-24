/* ============================================================================
   Performance.

   Measures what a first-time visitor actually experiences: bytes over the
   wire before the page is usable, and the Core Web Vitals that follow from
   them. Deliberately stops at `load` rather than at network idle — the hero
   carousel keeps fetching for as long as it rotates, which says nothing
   about how fast the page arrived.

     npm run build && npm start &
     npm run perf
   ========================================================================= */

import puppeteer from "puppeteer-core";

const BASE = process.env.BASE ?? "http://localhost:3000";
const CHROME =
  process.env.CHROME ?? "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

const PAGES = ["", "what-we-do", "customer-stories", "about", "contact"];

/* Budgets. Google's "good" thresholds for LCP and CLS, plus a transfer
   ceiling that keeps the page usable on a slow connection. */
const BUDGET = { lcp: 2500, cls: 0.1, fcp: 1800, kb: 900 };

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});

let fails = 0;
const rows = [];

for (const slug of PAGES) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
  await page.setCacheEnabled(false);

  let bytes = 0;
  let imageBytes = 0;
  page.on("response", (res) => {
    const len = Number(res.headers()["content-length"] || 0);
    bytes += len;
    if (res.request().resourceType() === "image") imageBytes += len;
  });

  // Register the observers before anything paints.
  await page.evaluateOnNewDocument(() => {
    window.__vitals = { lcp: 0, cls: 0 };
    new PerformanceObserver((l) => {
      const e = l.getEntries().at(-1);
      if (e) window.__vitals.lcp = e.startTime;
    }).observe({ type: "largest-contentful-paint", buffered: true });
    new PerformanceObserver((l) => {
      for (const e of l.getEntries()) if (!e.hadRecentInput) window.__vitals.cls += e.value;
    }).observe({ type: "layout-shift", buffered: true });
  });

  await page.goto(`${BASE}/${slug}`, { waitUntil: "load", timeout: 45000 });

  // The opening curtain covers the hero, so the largest paint has not
  // happened while it is still up. Waiting a fixed moment after `load` would
  // report the curtain's own line as LCP and call it fast, which measures the
  // wrong thing: what matters is when the headline behind it arrives.
  await page
    .waitForFunction(() => !document.querySelector(".loader"), { timeout: 15000, polling: 100 })
    .catch(() => {});
  // Then let the hero itself settle, so LCP and any shift it causes count.
  await new Promise((r) => setTimeout(r, 1500));

  const m = await page.evaluate(() => {
    const nav = performance.getEntriesByType("navigation")[0];
    const fcp = performance.getEntriesByName("first-contentful-paint")[0];
    return {
      ttfb: Math.round(nav?.responseStart ?? 0),
      fcp: Math.round(fcp?.startTime ?? 0),
      lcp: Math.round(window.__vitals.lcp),
      cls: Number(window.__vitals.cls.toFixed(3)),
      unoptimised: [...document.images].filter((i) => i.currentSrc && !i.currentSrc.includes("/_next/image")).length,
    };
  });

  const kb = Math.round(bytes / 1024);
  const imgKb = Math.round(imageBytes / 1024);
  rows.push({ slug: "/" + slug, ...m, kb, imgKb });

  const bad = [];
  if (m.lcp > BUDGET.lcp) bad.push(`LCP ${m.lcp}ms > ${BUDGET.lcp}`);
  if (m.cls > BUDGET.cls) bad.push(`CLS ${m.cls} > ${BUDGET.cls}`);
  if (m.fcp > BUDGET.fcp) bad.push(`FCP ${m.fcp}ms > ${BUDGET.fcp}`);
  if (kb > BUDGET.kb) bad.push(`${kb}KB > ${BUDGET.kb}KB`);
  if (m.unoptimised > 0) bad.push(`${m.unoptimised} unoptimised image(s)`);
  if (bad.length) {
    console.log(`/${slug}`);
    bad.forEach((b) => { console.log("   FAIL " + b); fails++; });
  }

  await page.close();
}

await browser.close();

console.log("\npage                 TTFB   FCP   LCP    CLS    total   images");
console.log("-------------------------------------------------------------");
for (const r of rows) {
  console.log(
    r.slug.padEnd(20),
    String(r.ttfb + "ms").padStart(5),
    String(r.fcp + "ms").padStart(6),
    String(r.lcp + "ms").padStart(6),
    String(r.cls).padStart(6),
    String(r.kb + "KB").padStart(7),
    String(r.imgKb + "KB").padStart(8)
  );
}

console.log(
  fails === 0
    ? `\nPerformance passed. Budgets: LCP <${BUDGET.lcp}ms, CLS <${BUDGET.cls}, FCP <${BUDGET.fcp}ms, <${BUDGET.kb}KB.`
    : `\nPerformance: ${fails} budget breach(es).`
);
process.exit(fails === 0 ? 0 : 1);
