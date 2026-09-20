"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";

import { Modules, accentVar } from "@/components/brand/Modules";
import type { TeamSection } from "@/lib/types";

/* ============================================================================
   Team.

   The client's Notion markup of the Scion team layout: photograph, name, a
   role marked with the square dot, and a "Show bio" disclosure that opens the
   background rather than printing it all at once. Room for three; the two
   unconfirmed profiles render at full size so the gap is visible.
   ========================================================================= */

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export function TeamGrid({ data }: { data: TeamSection }) {
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const reduce = useReducedMotion();

  return (
    <section className="section">
      <div className="wrap">
        <p className="eyebrow">{data.eyebrow}</p>
        <h2 className="h2 duotone" style={{ marginTop: "var(--space-4)", maxWidth: "32ch" }}>
          {data.title}
          {data.titleTail ? <em> {data.titleTail}</em> : null}
        </h2>
        <p className="body secondary" style={{ marginTop: "var(--space-4)" }}>
          {data.intro}
        </p>

        <div className="team" style={{ marginTop: "var(--space-7)" }}>
          {data.members.map((m) => {
            const isOpen = open[m.id] ?? false;
            const label = m.name || "Name to follow";

            return (
              <article
                key={m.id}
                className={`member${m.placeholder ? " member--empty" : ""}`}
                style={{ ["--accent" as string]: accentVar[m.accent] }}
              >
                <div className="member__photo">
                  {m.photo.src ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={m.photo.src} alt={m.photo.alt} loading="lazy" decoding="async" />
                  ) : (
                    <div style={{ width: "46%", opacity: 0.6 }}>
                      <Modules accent={m.accent} />
                    </div>
                  )}
                </div>

                <div className="member__body">
                  <h3 className="member__name">{label}</h3>

                  <div className="member__meta">
                    <span className="member__role">{m.role}</span>
                    {m.bio ? (
                      <button
                        type="button"
                        className="member__toggle"
                        aria-expanded={isOpen}
                        aria-controls={`bio-${m.id}`}
                        onClick={() => setOpen((o) => ({ ...o, [m.id]: !isOpen }))}
                      >
                        {isOpen ? "Hide bio" : "Show bio"}
                        <span className={`member__chev${isOpen ? " member__chev--up" : ""}`} aria-hidden="true" />
                      </button>
                    ) : null}
                  </div>

                  {/* The bio stays in the markup whether or not it is open,
                      so it is in the page source for search engines and for
                      anyone who never opens it. Collapsing is visual only;
                      aria-hidden takes it out of the accessibility tree while
                      it is closed, which is what a disclosure should do. */}
                  <motion.div
                    id={`bio-${m.id}`}
                    aria-hidden={!isOpen}
                    initial={false}
                    animate={{ height: isOpen ? "auto" : 0, opacity: isOpen ? 1 : 0 }}
                    transition={{ duration: reduce ? 0 : 0.32, ease: EASE }}
                    style={{ overflow: "hidden" }}
                  >
                    <p className="member__bio">{m.bio}</p>
                    {m.credentials.length ? (
                      <p className="tag member__creds">{m.credentials.join(" · ")}</p>
                    ) : null}
                  </motion.div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
