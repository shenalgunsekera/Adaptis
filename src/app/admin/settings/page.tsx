"use client";

import { useEffect, useState } from "react";

import { AdminShell } from "@/components/admin/Shell";
import { useAuth } from "@/components/admin/Auth";
import type { NavItem, SiteSettings } from "@/lib/types";

/* ============================================================================
   Navigation, footer and site-wide copy.

   The call to action appears in nineteen places and reads the same in every
   one of them, so it is edited once, here.
   ========================================================================= */

const rid = (p: string) => `${p}-${Math.random().toString(36).slice(2, 8)}`;

function LinkRows({
  items,
  onChange,
  label,
}: {
  items: NavItem[];
  onChange: (next: NavItem[]) => void;
  label: string;
}) {
  return (
    <div className="adm__field">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
        <span className="adm__label">
          {label} <span className="adm__count">({items.length})</span>
        </span>
        <button
          type="button"
          className="adm__btn adm__btn--sm"
          onClick={() => onChange([...items, { id: rid("nav"), label: "", href: "" }])}
        >
          Add link
        </button>
      </div>

      {items.map((item, i) => (
        <div key={item.id} style={{ display: "flex", gap: 6, marginTop: 6, alignItems: "flex-start" }}>
          <input
            className="adm__input"
            placeholder="Label"
            aria-label={`${label} ${i + 1} label`}
            value={item.label}
            onChange={(e) => {
              const next = [...items];
              next[i] = { ...item, label: e.target.value };
              onChange(next);
            }}
          />
          <input
            className="adm__input"
            placeholder="/address"
            aria-label={`${label} ${i + 1} address`}
            value={item.href}
            onChange={(e) => {
              const next = [...items];
              next[i] = { ...item, href: e.target.value };
              onChange(next);
            }}
          />
          <div style={{ display: "flex", gap: 2 }}>
            <button
              type="button"
              className="adm__btn adm__btn--quiet adm__btn--sm"
              aria-label="Move up"
              disabled={i === 0}
              onClick={() => {
                const next = [...items];
                [next[i - 1], next[i]] = [next[i], next[i - 1]];
                onChange(next);
              }}
            >
              ↑
            </button>
            <button
              type="button"
              className="adm__btn adm__btn--quiet adm__btn--sm"
              aria-label="Remove"
              onClick={() => onChange(items.filter((_, j) => j !== i))}
            >
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function SettingsPage() {
  const { api, user } = useAuth();
  const [s, setS] = useState<SiteSettings | null>(null);
  const [original, setOriginal] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    api<{ settings: SiteSettings }>("/api/admin/settings")
      .then((r) => {
        setS(r.settings);
        setOriginal(JSON.stringify(r.settings));
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Could not load."));
  }, [api, user]);

  if (!s) {
    return (
      <AdminShell title="Navigation and footer">
        {error ? <div className="adm__notice adm__notice--error">{error}</div> : <p className="adm__empty">Loading…</p>}
      </AdminShell>
    );
  }

  const dirty = JSON.stringify(s) !== original;

  async function save() {
    if (!s) return;
    setSaving(true);
    setError(null);
    setStatus(null);
    try {
      await api("/api/admin/settings", { method: "PUT", body: JSON.stringify(s) });
      setOriginal(JSON.stringify(s));
      setStatus("Saved.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AdminShell
      title="Navigation and footer"
      description="Everything that appears on every page."
    >
      {error ? <div className="adm__notice adm__notice--error">{error}</div> : null}
      {status ? <div className="adm__notice adm__notice--ok">{status}</div> : null}

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ marginBottom: 12 }}>Call to action</h2>
        <div className="adm__grid2">
          <div className="adm__field">
            <label className="adm__label" htmlFor="cta-label">
              Label
            </label>
            <input
              id="cta-label"
              className="adm__input"
              value={s.ctaLabel}
              onChange={(e) => setS({ ...s, ctaLabel: e.target.value })}
            />
            <p className="adm__hint">
              Appears in nineteen positions and reads the same in all of them.
            </p>
          </div>
          <div className="adm__field">
            <label className="adm__label" htmlFor="cta-href">
              Address
            </label>
            <input
              id="cta-href"
              className="adm__input"
              value={s.ctaHref}
              onChange={(e) => setS({ ...s, ctaHref: e.target.value })}
            />
          </div>
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ marginBottom: 12 }}>Navigation</h2>
        <LinkRows label="Header" items={s.nav} onChange={(nav) => setS({ ...s, nav })} />
        <LinkRows
          label="Areas of work sub-navigation"
          items={s.subnav}
          onChange={(subnav) => setS({ ...s, subnav })}
        />
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ marginBottom: 12 }}>Footer</h2>

        <div className="adm__field">
          <label className="adm__label" htmlFor="f-line">
            Line under the lockup
          </label>
          <textarea
            id="f-line"
            className="adm__textarea"
            value={s.footer.line}
            onChange={(e) => setS({ ...s, footer: { ...s.footer, line: e.target.value } })}
          />
        </div>

        {s.footer.columns.map((col, ci) => (
          <div key={col.id} className="adm__repeat">
            <input
              className="adm__input"
              style={{ marginBottom: 8, fontWeight: 600 }}
              aria-label="Column heading"
              value={col.title}
              onChange={(e) => {
                const columns = [...s.footer.columns];
                columns[ci] = { ...col, title: e.target.value };
                setS({ ...s, footer: { ...s.footer, columns } });
              }}
            />
            <LinkRows
              label="Links"
              items={col.links}
              onChange={(links) => {
                const columns = [...s.footer.columns];
                columns[ci] = { ...col, links };
                setS({ ...s, footer: { ...s.footer, columns } });
              }}
            />
          </div>
        ))}

        <div className="adm__grid2">
          <div className="adm__field">
            <label className="adm__label" htmlFor="f-email">
              Email
            </label>
            <input
              id="f-email"
              className="adm__input"
              value={s.footer.email}
              onChange={(e) => setS({ ...s, footer: { ...s.footer, email: e.target.value } })}
            />
          </div>
          <div className="adm__field">
            <label className="adm__label" htmlFor="f-phone">
              Telephone
            </label>
            <input
              id="f-phone"
              className="adm__input"
              value={s.footer.phone}
              onChange={(e) => setS({ ...s, footer: { ...s.footer, phone: e.target.value } })}
            />
          </div>
          <div className="adm__field">
            <label className="adm__label" htmlFor="f-li">
              LinkedIn
            </label>
            <input
              id="f-li"
              className="adm__input"
              value={s.footer.linkedin}
              onChange={(e) => setS({ ...s, footer: { ...s.footer, linkedin: e.target.value } })}
            />
          </div>
          <div className="adm__field">
            <label className="adm__label" htmlFor="f-copy">
              Copyright
            </label>
            <input
              id="f-copy"
              className="adm__input"
              value={s.footer.copyright}
              onChange={(e) => setS({ ...s, footer: { ...s.footer, copyright: e.target.value } })}
            />
          </div>
        </div>

        <div className="adm__field">
          <label className="adm__label" htmlFor="f-addr">
            Address, one line each
          </label>
          <textarea
            id="f-addr"
            className="adm__textarea"
            value={s.footer.address.join("\n")}
            onChange={(e) =>
              setS({ ...s, footer: { ...s.footer, address: e.target.value.split("\n") } })
            }
          />
        </div>

        <div className="adm__field">
          <label className="adm__label" htmlFor="f-closing">
            Closing line
          </label>
          <input
            id="f-closing"
            className="adm__input"
            value={s.footer.closingLine}
            onChange={(e) => setS({ ...s, footer: { ...s.footer, closingLine: e.target.value } })}
          />
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ marginBottom: 12 }}>Enquiries and search engines</h2>
        <div className="adm__grid2">
          <div className="adm__field">
            <label className="adm__label" htmlFor="notify">
              Send enquiry notifications to
            </label>
            <input
              id="notify"
              className="adm__input"
              value={s.contact.notifyEmail}
              onChange={(e) => setS({ ...s, contact: { ...s.contact, notifyEmail: e.target.value } })}
            />
            <p className="adm__hint">
              Every enquiry is stored in this panel regardless of whether the email arrives.
            </p>
          </div>
          <div className="adm__field">
            <label className="adm__label" htmlFor="site-url">
              Site address
            </label>
            <input
              id="site-url"
              className="adm__input"
              value={s.seo.siteUrl}
              onChange={(e) => setS({ ...s, seo: { ...s.seo, siteUrl: e.target.value } })}
            />
          </div>
        </div>
        <div className="adm__field">
          <label className="adm__label" htmlFor="seo-default">
            Default meta description
          </label>
          <textarea
            id="seo-default"
            className="adm__textarea"
            value={s.seo.defaultDescription}
            onChange={(e) => setS({ ...s, seo: { ...s.seo, defaultDescription: e.target.value } })}
          />
        </div>
      </section>

      <div className="adm__bar">
        <button
          type="button"
          className="adm__btn adm__btn--primary"
          disabled={saving || !dirty}
          onClick={() => void save()}
        >
          {saving ? "Saving…" : dirty ? "Save changes" : "Saved"}
        </button>
        <button
          type="button"
          className="adm__btn adm__btn--quiet"
          disabled={!dirty}
          onClick={() => setS(JSON.parse(original) as SiteSettings)}
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
