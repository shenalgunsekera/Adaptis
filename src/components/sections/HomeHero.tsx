"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionTemplate,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";

import { Modules, accentVar } from "@/components/brand/Modules";
import type { HomeHeroSection } from "@/lib/types";
import { heroDelay } from "@/lib/boot";

/* ============================================================================
   Home hero — full-bleed image carousel with a translucent overlay.

   The Scion move the client marked up, with two departures the brand system
   requires:

   1. The overlay is flat colour at alpha, never a gradient. Ink at 62 per
      cent over the photograph puts Card type past 7:1 on the worst frame.

   2. The h1 does not change with the slide. One h1 per page is a hard rule,
      so the headline is fixed and the carousel moves the photograph and the
      right-hand card, which is where each service line identifies itself.

   A slide with no photograph draws the module grammar instead, so the hero is
   correct before anything is licensed and stays correct if an image fails.
   ========================================================================= */

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

/** Splits the headline so its last phrase can be set in serif italic — the
    one typographic flourish, and the Scion "forward." move. */
function splitHeadline(title: string): { head: string; tail: string } {
  const trimmed = title.trim();
  const words = trimmed.split(" ");
  if (words.length < 4) return { head: trimmed, tail: "" };
  // The final two words carry the emphasis.
  return {
    head: words.slice(0, -2).join(" "),
    tail: words.slice(-2).join(" "),
  };
}

export function HomeHero({ data }: { data: HomeHeroSection }) {
  const slides = data.slides;
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [failed, setFailed] = useState<Record<string, boolean>>({});
  const reduce = useReducedMotion();

  const count = slides.length;
  const go = useCallback(
    (next: number) => {
      if (count === 0) return;
      setIndex(((next % count) + count) % count);
    },
    [count]
  );

  useEffect(() => {
    if (count < 2 || paused || data.autoplayMs <= 0 || reduce) return;
    const id = window.setInterval(() => {
      if (document.hidden) return;
      setIndex((i) => (i + 1) % count);
    }, data.autoplayMs);
    return () => window.clearInterval(id);
  }, [count, paused, data.autoplayMs, reduce]);

  const active = slides[index];
  const accent = active ? accentVar[active.accent] : "var(--brand-naples)";
  const showImage = Boolean(active?.image.src) && !failed[active?.id ?? ""];
  const { head, tail } = splitHeadline(data.title);

  /* The board.

     At the very top the hero runs to all four edges. As the page scrolls it
     draws in and its corners round, so the hero becomes a panel sitting on
     the Ink ground rather than a full-bleed image. The spring is what keeps
     it smooth: the raw scroll value would track the wheel exactly and read
     as jitter. */
  const { scrollY } = useScroll();
  const eased = useSpring(scrollY, { stiffness: 120, damping: 28, restDelta: 0.5 });
  const insetRaw = useTransform(eased, [0, 340], [0, 14], { clamp: true });
  const radiusRaw = useTransform(eased, [0, 340], [0, 22], { clamp: true });
  const inset = useMotionTemplate`${insetRaw}px`;
  const radius = useMotionTemplate`${radiusRaw}px`;

  const boardStyle = reduce
    ? { ["--accent" as string]: accent }
    : {
        ["--accent" as string]: accent,
        marginInline: inset,
        marginBottom: inset,
        borderRadius: radius,
      };

  return (
    <motion.section
      className="hero on-ink"
      style={boardStyle}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      {/* --- The photograph, full bleed ------------------------------------ */}
      <div className="hero__media" aria-hidden={showImage ? undefined : "true"}>
        <AnimatePresence initial={false} mode="sync">
          <motion.div
            key={active?.id ?? "none"}
            className="hero__frame"
            initial={{ opacity: 0, scale: reduce ? 1 : 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ opacity: { duration: reduce ? 0 : 0.9, ease: EASE }, scale: { duration: reduce ? 0 : 7, ease: "linear" } }}
          >
            {showImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={active.image.src}
                alt={active.image.alt}
                loading="eager"
                decoding="async"
                onError={() => setFailed((f) => ({ ...f, [active.id]: true }))}
              />
            ) : (
              <div className="hero__nofoto">
                <Modules accent={active?.accent ?? "naples"} scale="hero" />
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Flat scrim, then the brand's own grid as a texture over it. */}
        <div className="hero__scrim" />
        <div className="hero__grid" />
      </div>

      {/* --- The content --------------------------------------------------- */}
      <div className="wrap hero__inner">
        <motion.div
          className="hero__lead"
          initial={reduce ? false : { opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: EASE, delay: heroDelay(0) }}
        >
          <p className="eyebrow">{data.eyebrow}</p>
          <h1 className="h1-home">
            {head} {tail ? <em className="h1-em">{tail}</em> : null}
          </h1>
        </motion.div>

        <motion.div
          className="hero__cards"
          initial={reduce ? false : { opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: EASE, delay: heroDelay(0.14) }}
        >
          {/* Left card: the lede and the two calls to action. */}
          <div className="hcard">
            <p className="hcard__body">{data.lede}</p>
            <div className="hero__actions">
              <Link
                href={data.primaryCta.href}
                className={`btn ${(data.primaryStyle ?? "primary") === "primary" ? "btn--primary" : "btn--oncard"}`}
              >
                {data.primaryCta.label}
              </Link>
              {data.secondaryCta ? (
                <Link href={data.secondaryCta.href} className="btn btn--glass">
                  {data.secondaryCta.label}
                </Link>
              ) : null}
            </div>
          </div>

          {/* Right card: the service line this slide belongs to. */}
          <div className="hcard hcard--accent">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={active?.id ?? "empty"}
                initial={reduce ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduce ? undefined : { opacity: 0, y: -8 }}
                transition={{ duration: 0.4, ease: EASE }}
              >
                <p className="eyebrow">{active?.eyebrow}</p>
                <p className="hcard__body" style={{ marginTop: "var(--space-4)" }}>
                  {active?.asideBody}
                </p>
                {active?.href ? (
                  <Link href={active.href} className="arrow-link" style={{ marginTop: "var(--space-5)" }}>
                    Explore this area
                  </Link>
                ) : null}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>

        {count > 1 ? (
          <motion.div
            className="hero__controls"
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, ease: EASE, delay: heroDelay(0.3) }}
          >
            <button type="button" className="icon-btn" onClick={() => go(index - 1)} aria-label="Previous area of work">
              <Arrow direction="left" />
            </button>
            <button type="button" className="icon-btn" onClick={() => go(index + 1)} aria-label="Next area of work">
              <Arrow direction="right" />
            </button>

            <div className="hero__dots" role="tablist" aria-label="Areas of work">
              {slides.map((slide, i) => (
                <button
                  key={slide.id}
                  type="button"
                  role="tab"
                  aria-selected={i === index}
                  aria-label={slide.eyebrow}
                  className="hero__dot"
                  data-active={i === index}
                  style={i === index ? { ["--accent" as string]: accentVar[slide.accent] } : undefined}
                  onClick={() => go(i)}
                />
              ))}
            </div>

            <span className="hero__count numeric">
              {String(index + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
            </span>
          </motion.div>
        ) : null}
      </div>

      <p className="sr-only" aria-live="polite">
        {active ? `${active.eyebrow}. Slide ${index + 1} of ${count}.` : ""}
      </p>
    </motion.section>
  );
}

function Arrow({ direction }: { direction: "left" | "right" }) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true" focusable="false">
      <g
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="square"
        transform={direction === "left" ? "rotate(180 9 9)" : undefined}
      >
        <path d="M2 9h13" />
        <path d="M10 4l5 5-5 5" />
      </g>
    </svg>
  );
}
