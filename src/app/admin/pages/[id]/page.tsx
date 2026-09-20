"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import { AdminShell, Findings } from "@/components/admin/Shell";
import { useAuth, ApiError } from "@/components/admin/Auth";
import { Fields } from "@/components/admin/FieldRenderer";
import { GROUND_OPTIONS, SECTION_FIELDS, SECTION_LABELS } from "@/components/admin/fields";
import { checkPage, type Finding } from "@/lib/brandCheck";
import type { Ground, Page, Section, SectionType } from "@/lib/types";

/* ============================================================================
   Page editor.

   Holds the whole page as one value, runs the brand checks on every keystroke,
   and saves the page whole. A page that breaks a hard rule is refused by the
   server; the editor can override deliberately, and the finding stays on the
   record either way.
   ========================================================================= */

function blankSection(type: SectionType): Section {
  const id = `${type}-${Math.random().toString(36).slice(2, 7)}`;
  const base = { id, ground: "ink" as Ground, visible: true };

  // Minimum viable body per type; every field is then editable below.
  const bodies: Record<SectionType, unknown> = {
    homeHero: { type, eyebrow: "", title: "", lede: "", primaryCta: { label: "Get in touch", href: "/contact" }, slides: [], autoplayMs: 7000 },
    pageHero: { type, eyebrow: "", title: "", lede: "", accent: "naples", showModules: true },
    prose: { type, paras: [""] },
    splitProse: { type, title: "", paras: [""], asideParas: [""] },
    cardGrid: { type, cards: [], accentKeyline: false },
    areaList: { type, areas: [] },
    serviceBlocks: { type, services: [], accent: "naples" },
    serviceIndex: { type, title: "", items: [] },
    imagePattern: { type, title: "", paras: [""], imageA: { src: "", alt: "" }, imageB: { src: "", alt: "" }, items: [], accent: "naples" },
    steps: { type, steps: [], accent: "naples" },
    list: { type, groups: [{ id: "g1", items: [""] }], accent: "naples" },
    caseStudies: { type, cases: [], accent: "cassiopeia", showGapSlot: false },
    quote: { type, text: "", attribution: "", accent: "naples" },
    band: { type, title: "", support: "", variant: "plain" },
    founderNote: { type, eyebrow: "", title: "", titleTail: "", left: [""], right: [""], name: "", role: "" },
    team: { type, eyebrow: "", title: "", intro: "", members: [] },
    impact: { type, eyebrow: "", title: "", lede: "", paras: [""], stats: [], clients: [], clientsNote: "" },
    lifecycle: { type, items: [] },
    contactForm: {
      type,
      title: "",
      submitLabel: "Get in touch",
      successMessage: "",
      privacyNote: "",
      labels: {
        name: "Name",
        organization: "Organization",
        email: "Email",
        subject: "What you are working on",
        message: "Anything you want us to know",
      },
      subjectOptions: [],
    },
    contactDetails: { type, title: "", lines: [""], email: "", phone: "", website: "", linkedin: "" },
    cta: { type, title: "", body: "", cta: { label: "Get in touch", href: "/contact" }, style: "primary" },
  };

  return { ...base, body: bodies[type] as Section["body"] };
}

export default function PageEditor() {
  const params = useParams<{ id: string }>();
  const id = params?.id ?? "";
  const { api, user } = useAuth();

  const [page, setPage] = useState<Page | null>(null);
  const [original, setOriginal] = useState<string>("");
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [adding, setAdding] = useState<SectionType | "">("");

  useEffect(() => {
    if (!user || !id) return;
    api<{ page: Page }>(`/api/admin/pages/${id}`)
      .then((r) => {
        setPage(r.page);
        setOriginal(JSON.stringify(r.page));
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Could not load this page."));
  }, [api, id, user]);

  const findings: Finding[] = useMemo(() => (page ? checkPage(page) : []), [page]);
  const errors = findings.filter((f) => f.severity === "error");
  const dirty = page ? JSON.stringify(page) !== original : false;

  // Warn before losing unsaved edits.
  useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  const save = useCallback(
    async (force = false) => {
      if (!page) return;
      setSaving(true);
      setError(null);
      setStatus(null);
      try {
        await api(`/api/admin/pages${force ? "?force=1" : ""}`, {
          method: "PUT",
          body: JSON.stringify(page),
        });
        setOriginal(JSON.stringify(page));
        setStatus("Saved. The live site updates within a few seconds.");
      } catch (e) {
        if (e instanceof ApiError && e.status === 409) {
          setError(
            "This page breaks a brand rule. Fix the findings below, or save anyway if the departure is deliberate."
          );
        } else {
          setError(e instanceof Error ? e.message : "Could not save.");
        }
      } finally {
        setSaving(false);
      }
    },
    [api, page]
  );

  if (!page) {
    return (
      <AdminShell title="Page">
        {error ? <div className="adm__notice adm__notice--error">{error}</div> : <p className="adm__empty">Loading…</p>}
      </AdminShell>
    );
  }

  function patchSection(index: number, patch: Partial<Section>) {
    setPage((p) => {
      if (!p) return p;
      const sections = [...p.sections];
      sections[index] = { ...sections[index], ...patch };
      return { ...p, sections };
    });
  }

  function moveSection(index: number, delta: number) {
    setPage((p) => {
      if (!p) return p;
      const to = index + delta;
      if (to < 0 || to >= p.sections.length) return p;
      const sections = [...p.sections];
      [sections[index], sections[to]] = [sections[to], sections[index]];
      return { ...p, sections };
    });
  }

  return (
    <AdminShell
      title={page.name}
      description={`/${page.slug} · ${page.sections.length} sections`}
      actions={
        <>
          <Link className="adm__btn" href="/admin/pages">
            All pages
          </Link>
          <a className="adm__btn" href={`/${page.slug}`} target="_blank" rel="noreferrer noopener">
            View
          </a>
        </>
      }
    >
      {error ? <div className="adm__notice adm__notice--error">{error}</div> : null}
      {status ? <div className="adm__notice adm__notice--ok">{status}</div> : null}

      {/* --- Checks ---------------------------------------------------------- */}
      <section style={{ marginBottom: 32 }}>
        <h2 style={{ marginBottom: 8 }}>Checks</h2>
        <Findings findings={findings} />
      </section>

      {/* --- Search engines --------------------------------------------------- */}
      <section style={{ marginBottom: 32 }}>
        <h2 style={{ marginBottom: 12 }}>Search engines</h2>
        <div className="adm__grid2">
          <div className="adm__field">
            <label className="adm__label" htmlFor="seo-title">
              Title
            </label>
            <input
              id="seo-title"
              className="adm__input"
              value={page.seo.title}
              onChange={(e) => setPage({ ...page, seo: { ...page.seo, title: e.target.value } })}
            />
          </div>
          <div className="adm__field">
            <label className="adm__label" htmlFor="page-name">
              Name in this panel
            </label>
            <input
              id="page-name"
              className="adm__input"
              value={page.name}
              onChange={(e) => setPage({ ...page, name: e.target.value })}
            />
          </div>
        </div>
        <div className="adm__field">
          <label className="adm__label" htmlFor="seo-desc">
            Meta description
          </label>
          <textarea
            id="seo-desc"
            className="adm__textarea"
            value={page.seo.description}
            onChange={(e) => setPage({ ...page, seo: { ...page.seo, description: e.target.value } })}
          />
          <span className="adm__count">{page.seo.description.length} characters, aim for 150 to 160</span>
        </div>
        <div className="adm__field">
          <label style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <input
              type="checkbox"
              checked={Boolean(page.seo.noindex)}
              onChange={(e) => setPage({ ...page, seo: { ...page.seo, noindex: e.target.checked } })}
            />
            <span className="adm__label" style={{ margin: 0 }}>
              Keep this page out of search results
            </span>
          </label>
        </div>
        <div className="adm__field">
          <label style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <input
              type="checkbox"
              checked={page.showSubnav}
              onChange={(e) => setPage({ ...page, showSubnav: e.target.checked })}
            />
            <span className="adm__label" style={{ margin: 0 }}>
              Show the areas-of-work sub-navigation
            </span>
          </label>
        </div>
      </section>

      {/* --- Sections ---------------------------------------------------------- */}
      <section>
        <h2 style={{ marginBottom: 12 }}>Sections</h2>

        {page.sections.map((section, i) => {
          const isOpen = open[section.id] ?? false;
          const defs = SECTION_FIELDS[section.body.type] ?? [];
          const swatch = GROUND_OPTIONS.find((g) => g.v === section.ground)?.swatch ?? "#fff";

          return (
            <article key={section.id} className="adm__section" data-open={isOpen}>
              <header className="adm__section__head">
                <span className="adm__repeat__n">{String(i + 1).padStart(2, "0")}</span>

                <button
                  type="button"
                  className="adm__btn adm__btn--quiet adm__btn--sm"
                  aria-expanded={isOpen}
                  onClick={() => setOpen((o) => ({ ...o, [section.id]: !isOpen }))}
                >
                  {isOpen ? "▾" : "▸"}{" "}
                  <span className="adm__section__title">{SECTION_LABELS[section.body.type]}</span>
                </button>

                <span className="adm__ground">
                  <span className="adm__swatch" style={{ background: swatch }} />
                  {section.ground}
                </span>

                {section.draft ? <span className="adm__marker adm__marker--draft">Awaiting sign-off</span> : null}
                {!section.visible ? <span className="adm__marker">Hidden</span> : null}

                <div className="adm__section__tools">
                  <button
                    type="button"
                    className="adm__btn adm__btn--quiet adm__btn--sm"
                    aria-label="Move up"
                    disabled={i === 0}
                    onClick={() => moveSection(i, -1)}
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    className="adm__btn adm__btn--quiet adm__btn--sm"
                    aria-label="Move down"
                    disabled={i === page.sections.length - 1}
                    onClick={() => moveSection(i, 1)}
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    className="adm__btn adm__btn--danger adm__btn--sm"
                    onClick={() => {
                      if (!window.confirm(`Remove the ${SECTION_LABELS[section.body.type]} section?`)) return;
                      setPage({ ...page, sections: page.sections.filter((_, j) => j !== i) });
                    }}
                  >
                    Remove
                  </button>
                </div>
              </header>

              {isOpen ? (
                <div className="adm__section__body">
                  <div className="adm__grid2">
                    <div className="adm__field">
                      <label className="adm__label" htmlFor={`ground-${section.id}`}>
                        Ground
                      </label>
                      <select
                        id={`ground-${section.id}`}
                        className="adm__select"
                        value={section.ground}
                        onChange={(e) => patchSection(i, { ground: e.target.value as Ground })}
                      >
                        {GROUND_OPTIONS.map((g) => (
                          <option key={g.v} value={g.v}>
                            {g.l}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="adm__field">
                      <label className="adm__label" htmlFor={`id-${section.id}`}>
                        Section id, used as the anchor
                      </label>
                      <input
                        id={`id-${section.id}`}
                        className="adm__input"
                        value={section.id}
                        onChange={(e) => patchSection(i, { id: e.target.value })}
                      />
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 20, flexWrap: "wrap", marginBottom: 16 }}>
                    <label style={{ display: "flex", alignItems: "center", gap: 9 }}>
                      <input
                        type="checkbox"
                        checked={section.visible}
                        onChange={(e) => patchSection(i, { visible: e.target.checked })}
                      />
                      <span className="adm__label" style={{ margin: 0 }}>
                        Show on the site
                      </span>
                    </label>
                    <label style={{ display: "flex", alignItems: "center", gap: 9 }}>
                      <input
                        type="checkbox"
                        checked={Boolean(section.draft)}
                        onChange={(e) => patchSection(i, { draft: e.target.checked })}
                      />
                      <span className="adm__label" style={{ margin: 0 }}>
                        Drafted, awaiting sign-off
                      </span>
                    </label>
                  </div>

                  <hr style={{ border: 0, borderTop: "1px solid var(--hairline)", margin: "0 0 18px" }} />

                  <Fields
                    defs={defs}
                    value={section.body as unknown as Record<string, unknown>}
                    onChange={(next) =>
                      patchSection(i, { body: next as unknown as Section["body"] })
                    }
                  />
                </div>
              ) : null}
            </article>
          );
        })}

        <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 18, flexWrap: "wrap" }}>
          <select
            className="adm__select"
            style={{ width: "auto", minWidth: 260 }}
            aria-label="Section to add"
            value={adding}
            onChange={(e) => setAdding(e.target.value as SectionType | "")}
          >
            <option value="">Add a section…</option>
            {(Object.keys(SECTION_LABELS) as SectionType[]).map((t) => (
              <option key={t} value={t}>
                {SECTION_LABELS[t]}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="adm__btn"
            disabled={!adding}
            onClick={() => {
              if (!adding) return;
              const section = blankSection(adding);
              setPage({ ...page, sections: [...page.sections, section] });
              setOpen((o) => ({ ...o, [section.id]: true }));
              setAdding("");
            }}
          >
            Add
          </button>
        </div>
      </section>

      {/* --- Save bar ----------------------------------------------------------- */}
      <div className="adm__bar">
        <button
          type="button"
          className="adm__btn adm__btn--primary"
          disabled={saving || !dirty}
          onClick={() => void save(false)}
        >
          {saving ? "Saving…" : dirty ? "Save changes" : "Saved"}
        </button>

        {errors.length > 0 ? (
          <button type="button" className="adm__btn adm__btn--danger" disabled={saving} onClick={() => void save(true)}>
            Save anyway, {errors.length} rule{errors.length === 1 ? "" : "s"} broken
          </button>
        ) : null}

        <button
          type="button"
          className="adm__btn adm__btn--quiet"
          disabled={!dirty}
          onClick={() => {
            if (!window.confirm("Discard every change since the last save?")) return;
            setPage(JSON.parse(original) as Page);
          }}
        >
          Discard changes
        </button>

        <span className="adm__hint" style={{ marginLeft: "auto" }}>
          {dirty ? "Unsaved changes" : "Everything saved"}
        </span>
      </div>
    </AdminShell>
  );
}
