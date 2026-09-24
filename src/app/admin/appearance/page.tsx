"use client";

import { useEffect, useState } from "react";

import { AdminShell } from "@/components/admin/Shell";
import { useAuth } from "@/components/admin/Auth";
import type { Appearance, SiteSettings } from "@/lib/types";

/* ============================================================================
   Appearance.

   What this screen deliberately does not offer is a colour picker. Every
   colour on the site comes from the Rise v2 palette and the rules that
   govern which value may sit on which ground; a free picker would let an
   editor break a contrast pair or put a barred colour where it cannot go.
   Colour choices stay where they belong — the accent selector on each
   section, which only offers values the brand actually has.

   What is open here is the judgement the system leaves open: how heavy the
   Ink over a photograph is, how fast the carousel moves, whether the lattice
   shows, whether the intro plays.
   ========================================================================= */

const DEFAULTS: Appearance = {
  heroScrimOpacity: 0.74,
  heroAutoplayMs: 7000,
  gridTexture: true,
  gridOpacity: 0.05,
  imageZoomOnHover: true,
  motionEnabled: true,
  loaderEnabled: true,
  loaderDurationMs: 1150,
};

/** Ink over a photograph. Below this the headline stops clearing AA on the
    brighter frames, which is a rule rather than a preference. */
const SCRIM_FLOOR = 0.55;

function Slider({
  label,
  hint,
  value,
  min,
  max,
  step,
  format,
  warn,
  onChange,
}: {
  label: string;
  hint?: string;
  value: number;
  min: number;
  max: number;
  step: number;
  format: (v: number) => string;
  warn?: string | null;
  onChange: (v: number) => void;
}) {
  return (
    <div className="adm__field">
      <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
        <span className="adm__label">{label}</span>
        <span className="adm__count">{format(value)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ width: "100%", accentColor: "#33332C" }}
        aria-label={label}
      />
      {hint ? <p className="adm__hint">{hint}</p> : null}
      {warn ? (
        <p className="adm__marker adm__marker--warning" style={{ marginTop: 4 }}>
          {warn}
        </p>
      ) : null}
    </div>
  );
}

function Toggle({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint?: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="adm__field">
      <label style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}>
        <input type="checkbox" checked={value} onChange={(e) => onChange(e.target.checked)} />
        <span className="adm__label" style={{ margin: 0 }}>
          {label}
        </span>
      </label>
      {hint ? <p className="adm__hint">{hint}</p> : null}
    </div>
  );
}

export default function AppearancePage() {
  const { api, user } = useAuth();
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [original, setOriginal] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    api<{ settings: SiteSettings }>("/api/admin/settings")
      .then((r) => {
        const withDefaults = { ...r.settings, appearance: { ...DEFAULTS, ...r.settings.appearance } };
        setSettings(withDefaults);
        setOriginal(JSON.stringify(withDefaults));
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Could not load."));
  }, [api, user]);

  if (!settings) {
    return (
      <AdminShell title="Appearance">
        {error ? (
          <div className="adm__notice adm__notice--error">{error}</div>
        ) : (
          <p className="adm__empty">Loading…</p>
        )}
      </AdminShell>
    );
  }

  const a = settings.appearance;
  const dirty = JSON.stringify(settings) !== original;
  const set = (patch: Partial<Appearance>) =>
    setSettings({ ...settings, appearance: { ...a, ...patch } });

  async function save() {
    if (!settings) return;
    setSaving(true);
    setError(null);
    setStatus(null);
    try {
      await api("/api/admin/settings", { method: "PUT", body: JSON.stringify(settings) });
      setOriginal(JSON.stringify(settings));
      setStatus("Saved. The live site updates within a few seconds.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AdminShell
      title="Appearance"
      description="The judgement calls the brand system leaves open. Colour is not one of them."
    >
      {error ? <div className="adm__notice adm__notice--error">{error}</div> : null}
      {status ? <div className="adm__notice adm__notice--ok">{status}</div> : null}

      <div className="adm__notice">
        Every colour on the site comes from the Rise v2 palette, and which value may
        sit on which ground is fixed by the brand rules. That is why there is no
        colour picker here: a section&rsquo;s accent is chosen on the section itself,
        from the five the brand actually has.
      </div>

      <section style={{ marginBottom: 32, maxWidth: 560 }}>
        <h2 style={{ marginBottom: 16 }}>Hero</h2>

        <Slider
          label="Overlay over the photograph"
          hint="Ink laid over the hero image so the headline can be read against it."
          value={a.heroScrimOpacity}
          min={0.4}
          max={0.9}
          step={0.01}
          format={(v) => `${Math.round(v * 100)}%`}
          warn={
            a.heroScrimOpacity < SCRIM_FLOOR
              ? `Below ${Math.round(SCRIM_FLOOR * 100)}% the headline stops clearing AA on the brighter frames.`
              : null
          }
          onChange={(heroScrimOpacity) => set({ heroScrimOpacity })}
        />

        <Slider
          label="Seconds between slides"
          hint="Set to zero to hold on the first slide. Autoplay always stops under reduced motion."
          value={a.heroAutoplayMs}
          min={0}
          max={15000}
          step={500}
          format={(v) => (v === 0 ? "off" : `${(v / 1000).toFixed(1)}s`)}
          onChange={(heroAutoplayMs) => set({ heroAutoplayMs })}
        />
      </section>

      <section style={{ marginBottom: 32, maxWidth: 560 }}>
        <h2 style={{ marginBottom: 16 }}>Texture and motion</h2>

        <Toggle
          label="Show the module lattice"
          hint="The brand's own grid, carried at low contrast over the hero."
          value={a.gridTexture}
          onChange={(gridTexture) => set({ gridTexture })}
        />
        {a.gridTexture ? (
          <Slider
            label="Lattice strength"
            value={a.gridOpacity}
            min={0.02}
            max={0.14}
            step={0.005}
            format={(v) => `${(v * 100).toFixed(1)}%`}
            onChange={(gridOpacity) => set({ gridOpacity })}
          />
        ) : null}

        <Toggle
          label="Photographs lift on hover"
          value={a.imageZoomOnHover}
          onChange={(imageZoomOnHover) => set({ imageZoomOnHover })}
        />
        <Toggle
          label="Sections arrive as they scroll into view"
          hint="A reader who has asked their system for less motion never sees any of it, whatever this is set to."
          value={a.motionEnabled}
          onChange={(motionEnabled) => set({ motionEnabled })}
        />
      </section>

      <section style={{ marginBottom: 32, maxWidth: 560 }}>
        <h2 style={{ marginBottom: 16 }}>Opening curtain</h2>

        <Toggle
          label="Play the intro on a fresh page load"
          hint="Shown on a first load and on a refresh, never between pages."
          value={a.loaderEnabled}
          onChange={(loaderEnabled) => set({ loaderEnabled })}
        />
        {a.loaderEnabled ? (
          <Slider
            label="How long it holds"
            hint="Anything past about a second and a half is felt as a delay rather than as an arrival."
            value={a.loaderDurationMs}
            min={400}
            max={2500}
            step={50}
            format={(v) => `${(v / 1000).toFixed(2)}s`}
            warn={a.loaderDurationMs > 1600 ? "Long enough that readers will feel it." : null}
            onChange={(loaderDurationMs) => set({ loaderDurationMs })}
          />
        ) : null}
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
          onClick={() => setSettings(JSON.parse(original) as SiteSettings)}
        >
          Discard changes
        </button>
        <button
          type="button"
          className="adm__btn adm__btn--quiet"
          onClick={() => set(DEFAULTS)}
        >
          Reset to defaults
        </button>
        <span className="adm__hint" style={{ marginLeft: "auto" }}>
          {dirty ? "Unsaved changes" : "Everything saved"}
        </span>
      </div>
    </AdminShell>
  );
}
