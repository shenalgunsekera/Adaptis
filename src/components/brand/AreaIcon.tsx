import type { Accent } from "@/lib/types";
import { accentVar } from "./Modules";

/* ============================================================================
   Service-line icons.

   Handoff section 2: "An individual visual identity for each of the five
   service lines. Each area of work should be recognisable on sight."

   These are not a borrowed icon set. Each is drawn in the brand's own module
   grammar — squares on a zero-gutter grid, joined fused, seamed or bridged,
   convex corners at r = 0.35 of the tile edge — so the five read as one
   family and as the same language as the module compositions and the
   connective-tissue pattern.

   Each glyph says something about its area:
     record       four tiles gathered into one block: scattered data, held
     assessments  four quadrants meeting on a shared seam: assessed together
     capital      a stepped run: work sequenced over a horizon
     managed      one long retained span with satellites: across the hold
     reporting    a stack resolving into a single output: one dataset, many
                  audiences
   ========================================================================= */

interface Tile {
  x: number;
  y: number;
  w?: number;
  h?: number;
  /** "on" is the accent, "off" is the hairline ghost, "line" is outline only. */
  k: "on" | "off" | "line";
  r?: [number, number, number, number];
}

const GLYPHS: Record<string, Tile[]> = {
  record: [
    { x: 0, y: 0, k: "on", r: [1, 0, 0, 1] },
    { x: 1, y: 0, k: "off", r: [0, 1, 1, 0] },
    { x: 0, y: 1, k: "off", r: [1, 0, 0, 1] },
    { x: 1, y: 1, k: "on", r: [0, 1, 1, 0] },
    { x: 3, y: 1, k: "line", r: [1, 1, 1, 1] },
  ],
  assessments: [
    { x: 1, y: 0, k: "off", r: [1, 1, 0, 1] },
    { x: 0, y: 1, k: "on", r: [1, 0, 1, 1] },
    { x: 1, y: 1, k: "on", r: [0, 1, 0, 0] },
    { x: 2, y: 1, k: "off", r: [1, 1, 1, 0] },
    { x: 1, y: 2, k: "line", r: [1, 0, 1, 1] },
  ],
  capital: [
    { x: 0, y: 2, k: "off", r: [1, 0, 1, 1] },
    { x: 1, y: 2, k: "on", r: [0, 0, 0, 0] },
    { x: 1, y: 1, k: "on", r: [1, 0, 0, 1] },
    { x: 2, y: 1, k: "off", r: [0, 0, 0, 0] },
    { x: 2, y: 0, k: "on", r: [1, 1, 0, 1] },
  ],
  managed: [
    { x: 0, y: 1, w: 3, k: "on", r: [1, 1, 1, 1] },
    { x: 0, y: 0, k: "off", r: [1, 1, 0, 1] },
    { x: 3, y: 2, k: "line", r: [1, 1, 1, 1] },
  ],
  reporting: [
    { x: 0, y: 0, k: "off", r: [1, 1, 0, 1] },
    { x: 0, y: 1, k: "off", r: [1, 0, 0, 1] },
    { x: 0, y: 2, k: "off", r: [1, 0, 1, 1] },
    { x: 1, y: 1, k: "on", r: [0, 1, 1, 0] },
    { x: 3, y: 1, k: "line", r: [1, 1, 1, 1] },
  ],
};

export type GlyphKey = keyof typeof GLYPHS;

/** The five accents map one-to-one onto the five areas. */
export const glyphForAccent: Record<Accent, GlyphKey> = {
  naples: "record",
  cassiopeia: "assessments",
  apricot: "capital",
  "naples-light": "managed",
  billabong: "reporting",
  none: "record",
};

export function AreaIcon({
  accent = "naples",
  glyph,
  size = 40,
  className,
}: {
  accent?: Accent;
  glyph?: GlyphKey;
  size?: number;
  className?: string;
}) {
  const key = glyph ?? glyphForAccent[accent];
  const tiles = GLYPHS[key];
  const u = 100;
  const r = 0.35 * u;
  const cols = 4;
  const rows = 3;

  const path = (t: Tile) => {
    const tw = (t.w ?? 1) * u;
    const th = (t.h ?? 1) * u;
    const [tl, tr, br, bl] = t.r ?? [1, 1, 1, 1];
    const x = t.x * u;
    const y = t.y * u;
    return [
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
  };

  return (
    <svg
      viewBox={`0 0 ${cols * u} ${rows * u}`}
      width={size * (cols / rows)}
      height={size}
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      {tiles.map((t, i) => (
        <path
          key={i}
          d={path(t)}
          fill={t.k === "on" ? accentVar[accent] : t.k === "off" ? "currentColor" : "none"}
          opacity={t.k === "off" ? 0.42 : 1}
          stroke={t.k === "line" ? accentVar[accent] : "none"}
          strokeWidth={t.k === "line" ? 8 : 0}
          strokeOpacity={t.k === "line" ? 0.6 : 1}
        />
      ))}
    </svg>
  );
}
