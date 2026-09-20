import type { Accent } from "@/lib/types";

/* ============================================================================
   Module grammar.

   The brand's own graphic language, and the safest source of visual interest
   on the site: squares on a zero-gutter grid, joined in three states — fused,
   seamed, bridged — never a closed enclosure and never a sealed body. Gaps are
   content, not spacing. Convex corners take r = 0.35 of the tile edge; a
   corner where a mass meets a band stays square.

   This stands in wherever photography has not yet been licensed, and it is
   what the hero falls back to if a slide has no image.
   ========================================================================= */

export const accentVar: Record<Accent, string> = {
  naples: "var(--brand-naples)",
  "naples-light": "var(--brand-naples-light)",
  apricot: "var(--brand-apricot)",
  cassiopeia: "var(--brand-cassiopeia)",
  billabong: "var(--brand-billabong)",
  none: "var(--line-on-ink-strong)",
};

/** A tile: column, row, span, fill, and which corners are rounded. */
interface Tile {
  x: number;
  y: number;
  w?: number;
  h?: number;
  fill: "accent" | "soft" | "line";
  /** Corner radii as tl tr br bl, each 0 or 1. Default all rounded. */
  r?: [number, number, number, number];
}

/* Five compositions, one per service line, so each area of work is
   recognisable on sight. Each is a different arrangement of the same
   grammar rather than a different language. */
const COMPOSITIONS: Record<string, { cols: number; rows: number; tiles: Tile[] }> = {
  /* Bridged: two masses joined across a gap. The record connecting sources. */
  record: {
    cols: 5,
    rows: 4,
    tiles: [
      { x: 0, y: 0, fill: "soft", r: [1, 0, 0, 1] },
      { x: 1, y: 0, fill: "accent", r: [0, 1, 1, 0] },
      { x: 3, y: 1, fill: "line", r: [1, 1, 0, 1] },
      { x: 2, y: 2, fill: "accent", r: [1, 0, 1, 1] },
      { x: 3, y: 2, fill: "soft", r: [0, 1, 1, 0] },
      { x: 0, y: 3, fill: "line", r: [1, 1, 1, 1] },
    ],
  },
  /* Seamed: four tiles meeting on a shared seam, assessed together. */
  assess: {
    cols: 5,
    rows: 4,
    tiles: [
      { x: 1, y: 0, fill: "line", r: [1, 1, 0, 1] },
      { x: 1, y: 1, fill: "accent", r: [0, 0, 0, 1] },
      { x: 2, y: 1, fill: "soft", r: [0, 1, 0, 0] },
      { x: 2, y: 2, fill: "accent", r: [0, 0, 1, 0] },
      { x: 1, y: 2, fill: "line", r: [1, 0, 0, 1] },
      { x: 4, y: 3, fill: "soft", r: [1, 1, 1, 1] },
    ],
  },
  /* Fused: a stepped run, the sequence of a capital plan. */
  capital: {
    cols: 5,
    rows: 4,
    tiles: [
      { x: 0, y: 2, fill: "line", r: [1, 0, 1, 1] },
      { x: 1, y: 2, fill: "soft", r: [0, 0, 0, 0] },
      { x: 1, y: 1, fill: "accent", r: [1, 1, 0, 1] },
      { x: 2, y: 1, fill: "soft", r: [0, 0, 0, 0] },
      { x: 2, y: 0, fill: "accent", r: [1, 1, 0, 1] },
      { x: 4, y: 3, fill: "line", r: [1, 1, 1, 1] },
    ],
  },
  /* A long retained span with satellites: the hold period. */
  managed: {
    cols: 5,
    rows: 4,
    tiles: [
      { x: 0, y: 1, w: 3, fill: "accent", r: [1, 0, 0, 1] },
      { x: 3, y: 1, fill: "soft", r: [0, 1, 1, 0] },
      { x: 1, y: 3, fill: "line", r: [1, 1, 1, 1] },
      { x: 3, y: 3, fill: "soft", r: [1, 1, 1, 1] },
      { x: 4, y: 0, fill: "line", r: [1, 1, 1, 1] },
    ],
  },
  /* A stacked column resolving into one output: reporting from one dataset. */
  reporting: {
    cols: 5,
    rows: 4,
    tiles: [
      { x: 0, y: 0, fill: "line", r: [1, 1, 0, 1] },
      { x: 0, y: 1, fill: "soft", r: [1, 0, 0, 1] },
      { x: 1, y: 1, fill: "accent", r: [0, 1, 1, 0] },
      { x: 0, y: 2, fill: "line", r: [1, 0, 1, 1] },
      { x: 3, y: 3, w: 2, fill: "accent", r: [1, 1, 1, 1] },
    ],
  },
};

export type CompositionKey = keyof typeof COMPOSITIONS;

export const compositionForAccent: Record<Accent, CompositionKey> = {
  naples: "record",
  cassiopeia: "assess",
  apricot: "capital",
  "naples-light": "managed",
  billabong: "reporting",
  none: "record",
};

export interface ModulesProps {
  accent?: Accent;
  composition?: CompositionKey;
  /** Tile edge in px within the viewBox. Scales with the container. */
  unit?: number;
  className?: string;
  /** Renders larger and fuller, for a hero slide standing in for a photo. */
  scale?: "art" | "hero";
}

export function Modules({
  accent = "naples",
  composition,
  unit = 100,
  className,
  scale = "art",
}: ModulesProps) {
  const key = composition ?? compositionForAccent[accent];
  const comp = COMPOSITIONS[key];
  const r = 0.35 * unit;

  const fills: Record<Tile["fill"], string> = {
    accent: accentVar[accent],
    // Hairline carried as a fill. At hero scale it has to hold its own
    // against the accent tiles, so it sits higher than it would as a divider.
    soft: scale === "hero" ? "rgba(216, 214, 212, 0.22)" : "rgba(216, 214, 212, 0.14)",
    line: "transparent",
  };

  const width = comp.cols * unit;
  const height = comp.rows * unit;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      width="100%"
      aria-hidden="true"
      focusable="false"
      style={{ display: "block", opacity: scale === "hero" ? 1 : 0.92 }}
    >
      {comp.tiles.map((t, i) => {
        const tw = (t.w ?? 1) * unit;
        const th = (t.h ?? 1) * unit;
        const [tl, tr, br, bl] = t.r ?? [1, 1, 1, 1];
        // A rounded rect drawn as a path so each corner can differ: the
        // grammar rounds convex corners only.
        const x = t.x * unit;
        const y = t.y * unit;
        const d = [
          `M ${x + (tl ? r : 0)} ${y}`,
          `H ${x + tw - (tr ? r : 0)}`,
          tr ? `A ${r} ${r} 0 0 1 ${x + tw} ${y + r}` : "",
          `V ${y + th - (br ? r : 0)}`,
          br ? `A ${r} ${r} 0 0 1 ${x + tw - r} ${y + th}` : "",
          `H ${x + (bl ? r : 0)}`,
          bl ? `A ${r} ${r} 0 0 1 ${x} ${y + th - r}` : "",
          `V ${y + (tl ? r : 0)}`,
          tl ? `A ${r} ${r} 0 0 1 ${x + r} ${y}` : "",
          "Z",
        ]
          .filter(Boolean)
          .join(" ");

        return (
          <path
            key={i}
            d={d}
            fill={fills[t.fill]}
            stroke={t.fill === "line" ? accentVar[accent] : "none"}
            strokeWidth={t.fill === "line" ? 2 : 0}
            opacity={t.fill === "line" ? 0.5 : 1}
          />
        );
      })}
    </svg>
  );
}

/* ---------------------------------------------------------------------------
   The connective-tissue field: the same grammar tiled quietly behind a
   section, at low contrast. Used where Scion uses a faint dot grid.
   ------------------------------------------------------------------------ */

export function ModuleField({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      aria-hidden="true"
      focusable="false"
      width="100%"
      height="100%"
      style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
    >
      <defs>
        <pattern id="adaptis-field" width="64" height="64" patternUnits="userSpaceOnUse">
          <rect x="0" y="0" width="6" height="6" fill="rgba(216,214,212,0.10)" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#adaptis-field)" />
    </svg>
  );
}
