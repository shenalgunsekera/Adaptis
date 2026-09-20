import type { Page, Section } from "@/lib/types";

/* ============================================================================
   Brand and accessibility checks.

   The handoff lists rules that "must not be broken", and the reason given is
   that breaking them is what makes a site stop looking like one firm. Rules
   that live only in a document get broken by the third editor. These run on
   every page in the admin panel, before a save.

   Severity:
     error    breaks a stated brand or accessibility rule; blocks nothing
              technically, but is shown as a failure that must be resolved
     warning  worth a second look; legitimate in some compositions
     note     informational, such as content still awaiting sign-off
   ========================================================================= */

export type Severity = "error" | "warning" | "note";

export interface Finding {
  severity: Severity;
  rule: string;
  message: string;
  sectionId?: string;
}

const LIGHT = new Set(["card", "page"]);

/** Counts the connected Naples forms a page carries. The rule is one. */
function naplesForms(sections: Section[]): { count: number; where: string[] } {
  const where: string[] = [];

  for (const s of sections) {
    if (!s.visible) continue;
    const b = s.body;

    if (b.type === "band" && b.variant === "naples") {
      where.push(`${s.id} (full-bleed Naples band)`);
    }
    if (b.type === "cta" && b.style === "primary") {
      where.push(`${s.id} (Naples call to action)`);
    }
    if (b.type === "homeHero" && (b.primaryStyle ?? "primary") === "primary") {
      where.push(`${s.id} (hero call to action)`);
    }
    if (b.type === "contactForm") {
      where.push(`${s.id} (form submit button)`);
    }
  }

  return { count: where.length, where };
}

function hasAllCaps(text: string): boolean {
  // Three or more consecutive capitalised words, ignoring acronyms and codes
  // that are legitimately upper case (LEED, ASHRAE, BCAs, O. Reg.).
  const words = text.split(/\s+/).filter((w) => /[A-Za-z]/.test(w));
  let run = 0;
  for (const w of words) {
    const letters = w.replace(/[^A-Za-z]/g, "");
    const isCaps = letters.length > 3 && letters === letters.toUpperCase();
    run = isCaps ? run + 1 : 0;
    if (run >= 3) return true;
  }
  return false;
}

export function checkPage(page: Page): Finding[] {
  const findings: Finding[] = [];
  const visible = page.sections.filter((s) => s.visible);

  /* --- One yellow per page ------------------------------------------------ */
  const naples = naplesForms(page.sections);
  if (naples.count === 0) {
    findings.push({
      severity: "warning",
      rule: "One Naples per page",
      message:
        "This page carries no Naples form. The brand expects one connected yellow per page, normally the primary call to action.",
    });
  } else if (naples.count > 1) {
    findings.push({
      severity: "error",
      rule: "One Naples per page",
      message: `This page carries ${naples.count} Naples forms: ${naples.where.join(
        ", "
      )}. Scattered yellow reads as several calls to action. Set all but one to Ink or Card.`,
    });
  }

  /* --- The two darks never touch -----------------------------------------
     The Halite footer sits below the last section on every page, so the last
     visible section must be light. This is the buffer rule, checked where it
     actually applies. */
  const last = visible[visible.length - 1];
  if (last && !LIGHT.has(last.ground)) {
    findings.push({
      severity: "error",
      rule: "The two darks never touch",
      message:
        "The last section on this page is dark, and the footer is Halite. Ink and Halite measure 1.05:1 against each other and need at least one full light section between them. Set the closing section to Card.",
      sectionId: last.id,
    });
  }

  /* --- Adjacent darks within the page ------------------------------------ */
  for (let i = 1; i < visible.length; i++) {
    const prev = visible[i - 1];
    const cur = visible[i];
    if (
      (prev.ground === "ink" && cur.ground === "halite") ||
      (prev.ground === "halite" && cur.ground === "ink")
    ) {
      findings.push({
        severity: "error",
        rule: "The two darks never touch",
        message: `Sections "${prev.id}" and "${cur.id}" put Ink and Halite next to each other. Place a full light section between them.`,
        sectionId: cur.id,
      });
    }
  }

  /* --- Halite is scarce --------------------------------------------------- */
  const haliteCount = visible.filter((s) => s.ground === "halite").length;
  if (haliteCount > 0) {
    findings.push({
      severity: "warning",
      rule: "Halite is scarce",
      message:
        "Halite appears in the page body. It is reserved for the footer, roughly once per document. Confirm this is intended.",
    });
  }

  /* --- One h1 per page ----------------------------------------------------- */
  const heroes = visible.filter((s) => s.body.type === "homeHero" || s.body.type === "pageHero");
  if (heroes.length === 0) {
    findings.push({
      severity: "error",
      rule: "One h1 per page",
      message: "This page has no hero, so it has no h1. Every page needs exactly one.",
    });
  } else if (heroes.length > 1) {
    findings.push({
      severity: "error",
      rule: "One h1 per page",
      message: `This page has ${heroes.length} heroes and therefore more than one h1. Keep one.`,
      sectionId: heroes[1].id,
    });
  }

  /* --- Sentence case throughout -------------------------------------------- */
  for (const s of visible) {
    const b = s.body as unknown as Record<string, unknown>;
    for (const key of ["title", "eyebrow", "lede", "name", "submitLabel"]) {
      const value = b[key];
      if (typeof value === "string" && hasAllCaps(value)) {
        findings.push({
          severity: "error",
          rule: "Sentence case throughout",
          message: `Section "${s.id}" has a run of capitals in its ${key}. No all-caps anywhere, including eyebrows and buttons.`,
          sectionId: s.id,
        });
      }
    }
  }

  /* --- Every figure carries a source --------------------------------------- */
  for (const s of visible) {
    if (s.body.type === "impact") {
      for (const stat of s.body.stats) {
        if (!stat.source.trim()) {
          findings.push({
            severity: "error",
            rule: "Every figure needs a source",
            message: `The figure "${stat.value}" in section "${s.id}" has no source. Aggregate impact statistics were dropped from the company profile in September; nothing goes back without provenance.`,
            sectionId: s.id,
          });
        }
      }
    }
    if (s.body.type === "caseStudies") {
      for (const c of s.body.cases) {
        for (const stat of c.stats) {
          if (!stat.source.trim()) {
            findings.push({
              severity: "warning",
              rule: "Every figure needs a source",
              message: `The figure "${stat.value}" in case study "${c.client}" has no source recorded.`,
              sectionId: s.id,
            });
          }
        }
      }
    }
  }

  /* --- Alt text on every image ---------------------------------------------- */
  const imagesMissingAlt: string[] = [];
  for (const s of visible) {
    const b = s.body;
    if (b.type === "homeHero") {
      for (const slide of b.slides) {
        if (slide.image.src && !slide.image.alt.trim()) imagesMissingAlt.push(`${s.id} / ${slide.id}`);
      }
    }
    if (b.type === "pageHero" && b.image?.src && !b.image.alt.trim()) imagesMissingAlt.push(s.id);
    if (b.type === "caseStudies") {
      for (const c of b.cases) {
        if (c.image.src && !c.image.alt.trim()) imagesMissingAlt.push(`${s.id} / ${c.client}`);
      }
    }
    if (b.type === "team") {
      for (const m of b.members) {
        if (m.photo.src && !m.photo.alt.trim()) imagesMissingAlt.push(`${s.id} / ${m.name || m.id}`);
      }
    }
  }
  if (imagesMissingAlt.length) {
    findings.push({
      severity: "error",
      rule: "Alt text on every image",
      message: `Images without alt text: ${imagesMissingAlt.join(", ")}.`,
    });
  }

  /* --- Content awaiting sign-off -------------------------------------------- */
  for (const s of page.sections) {
    if (s.draft) {
      findings.push({
        severity: "note",
        rule: "Awaiting sign-off",
        message: `Section "${s.id}" was drafted from existing material and has not been approved. It is live on the site. Review the wording and clear this flag.`,
        sectionId: s.id,
      });
    }
  }

  /* --- Gap slots still in place ---------------------------------------------- */
  for (const s of visible) {
    if (s.body.type === "caseStudies" && s.body.showGapSlot) {
      findings.push({
        severity: "note",
        rule: "Remove before launch",
        message: `Section "${s.id}" still shows the empty case study slot. Fill it or switch the slot off before launch.`,
        sectionId: s.id,
      });
    }
    if (s.body.type === "team") {
      const placeholders = s.body.members.filter((m) => m.placeholder);
      if (placeholders.length) {
        findings.push({
          severity: "note",
          rule: "Remove before launch",
          message: `${placeholders.length} team profile(s) in "${s.id}" are still placeholders.`,
          sectionId: s.id,
        });
      }
    }
  }

  /* --- SEO ------------------------------------------------------------------- */
  if (!page.seo.title.trim()) {
    findings.push({ severity: "error", rule: "SEO", message: "This page has no title." });
  }
  if (!page.seo.description.trim()) {
    findings.push({ severity: "warning", rule: "SEO", message: "This page has no meta description." });
  } else if (page.seo.description.length > 165) {
    findings.push({
      severity: "warning",
      rule: "SEO",
      message: `The meta description is ${page.seo.description.length} characters and will be truncated in results. Aim for 150 to 160.`,
    });
  }

  return findings;
}

export function summarise(findings: Finding[]) {
  return {
    errors: findings.filter((f) => f.severity === "error").length,
    warnings: findings.filter((f) => f.severity === "warning").length,
    notes: findings.filter((f) => f.severity === "note").length,
  };
}
