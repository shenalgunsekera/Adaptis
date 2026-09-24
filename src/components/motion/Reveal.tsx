"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion, useReducedMotion, type Variants } from "motion/react";

/* ============================================================================
   In-view reveals.

   The brand bars shadows, gradients, depth effects and rotation. None of
   those are motion rules, and nothing here breaks them: these animate
   opacity and a small translation only, so a section arrives rather than
   performs. Distances stay under 30px and durations under a second.

   prefers-reduced-motion is honoured by arriving instantly rather than by
   playing a shorter animation — same element, no travel, no duration.
   ========================================================================= */

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

type RevealKind = "up" | "fade" | "left" | "right" | "scale";

const kinds: Record<RevealKind, { hidden: Record<string, number>; shown: Record<string, number> }> = {
  up: { hidden: { opacity: 0, y: 24 }, shown: { opacity: 1, y: 0 } },
  fade: { hidden: { opacity: 0 }, shown: { opacity: 1 } },
  left: { hidden: { opacity: 0, x: -16 }, shown: { opacity: 1, x: 0 } },
  right: { hidden: { opacity: 0, x: 16 }, shown: { opacity: 1, x: 0 } },
  scale: { hidden: { opacity: 0, scale: 0.96 }, shown: { opacity: 1, scale: 1 } },
};

type Tag = "div" | "section" | "article" | "figure" | "li" | "span" | "p";

/* --- Arrival ----------------------------------------------------------------
   whileInView on its own is not safe for content that starts at zero opacity.
   A section hydrated after the reader has already flicked past it gets one
   "not intersecting" report and, because the reveal is once-only, stays
   invisible for the rest of the visit. Fast scrolling can also coalesce the
   callbacks that would have caught it on the way through. Either way a band
   of the page is simply gone, and the reader has no way to get it back.

   Arrival is therefore decided here: an observer for the ordinary case, plus
   a shared scroll-end sweep that reveals anything now on screen or already
   scrolled past. One listener serves every pending reveal on the page and
   detaches as soon as the last one has arrived, so a settled page does no
   work at all.
   -------------------------------------------------------------------------- */

const waiting = new Set<() => void>();
const SWEEP_MS = 120;
let lastSweep = 0;
let trailing: ReturnType<typeof setTimeout> | undefined;

function sweep() {
  lastSweep = performance.now();
  for (const check of [...waiting]) check();
}

/* Throttled with a trailing pass rather than debounced. Lenis eases every
   jump, so it keeps emitting scroll events for as long as it is animating;
   a debounce would have its timer reset on each one and never fire. */
function onScroll() {
  if (performance.now() - lastSweep >= SWEEP_MS) {
    sweep();
    return;
  }
  if (!trailing) {
    trailing = setTimeout(() => {
      trailing = undefined;
      sweep();
    }, SWEEP_MS);
  }
}

function watch(check: () => void): () => void {
  if (waiting.size === 0) {
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
  }
  waiting.add(check);

  return () => {
    waiting.delete(check);
    if (waiting.size === 0) {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (trailing) clearTimeout(trailing);
      trailing = undefined;
    }
  };
}

function useArrived(amount: number, skip = false) {
  const ref = useRef<HTMLElement | null>(null);
  const [arrived, setArrived] = useState(false);

  useEffect(() => {
    if (arrived || skip) return;
    const el = ref.current;
    if (!el) return;

    // The editor can switch section arrivals off for the whole site.
    if (el.closest('[data-motion="off"]')) {
      setArrived(true);
      return;
    }

    const show = () => setArrived(true);

    const check = () => {
      const r = el.getBoundingClientRect();
      if (r.height === 0 && r.width === 0) return; // not laid out yet
      if (r.bottom <= 0) return show(); // already scrolled past

      // A band taller than the window can never show `amount` of itself, so
      // the requirement is capped at what the window can actually hold.
      const visible = Math.min(r.bottom, window.innerHeight) - Math.max(r.top, 0);
      const needed = Math.min(r.height * amount, window.innerHeight * 0.9);
      if (visible > 0 && visible >= needed) show();
    };

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) show();
      },
      { threshold: Math.min(Math.max(amount, 0), 1), rootMargin: "0px 0px -8% 0px" }
    );
    io.observe(el);

    const unwatch = watch(check);
    check(); // covers hydration that lands after the reader has moved on

    return () => {
      io.disconnect();
      unwatch();
    };
  }, [amount, arrived, skip]);

  return [ref, arrived] as const;
}

export function Reveal({
  children,
  kind = "up",
  delay = 0,
  duration = 0.65,
  className,
  as = "div",
  amount = 0.25,
  style,
}: {
  children: ReactNode;
  kind?: RevealKind;
  delay?: number;
  duration?: number;
  className?: string;
  as?: Tag;
  amount?: number;
  style?: React.CSSProperties;
}) {
  const reduce = useReducedMotion();
  const [ref, arrived] = useArrived(amount, reduce === true);
  const v = kinds[kind];

  // Reduced motion is honoured by arriving instantly, not by rendering a
  // different element. Swapping motion.div for a plain div here left the
  // server's `opacity: 0` inline style behind on hydration — React does not
  // reconcile it away — so the section stayed invisible for exactly the
  // readers who asked for less movement.
  const M = motion[as] as typeof motion.div;
  const shown = reduce || arrived;

  return (
    <M
      ref={ref as React.Ref<HTMLDivElement>}
      className={className}
      style={style}
      initial={v.hidden}
      animate={shown ? v.shown : v.hidden}
      transition={reduce ? { duration: 0 } : { duration, delay, ease: EASE }}
    >
      {children}
    </M>
  );
}

/** Container whose children arrive in sequence as it enters view. */
export function RevealGroup({
  children,
  className,
  stagger = 0.07,
  delayChildren = 0,
  amount = 0.15,
  as = "div",
  style,
}: {
  children: ReactNode;
  className?: string;
  stagger?: number;
  delayChildren?: number;
  amount?: number;
  as?: Tag | "ul";
  style?: React.CSSProperties;
}) {
  const reduce = useReducedMotion();
  const [ref, arrived] = useArrived(amount, reduce === true);
  const M = motion[as as Tag] as typeof motion.div;

  const container: Variants = {
    hidden: {},
    shown: { transition: { staggerChildren: reduce ? 0 : stagger, delayChildren } },
  };

  return (
    <M
      ref={ref as React.Ref<HTMLDivElement>}
      className={className}
      style={style}
      variants={container}
      initial="hidden"
      animate={reduce || arrived ? "shown" : "hidden"}
    >
      {children}
    </M>
  );
}

export function RevealItem({
  children,
  kind = "up",
  duration = 0.6,
  className,
  as = "div",
  style,
}: {
  children: ReactNode;
  kind?: RevealKind;
  duration?: number;
  className?: string;
  as?: Tag;
  style?: React.CSSProperties;
}) {
  const reduce = useReducedMotion();
  const M = motion[as] as typeof motion.div;
  const v = kinds[kind];

  const variants: Variants = {
    hidden: reduce ? { opacity: 1 } : v.hidden,
    shown: { ...v.shown, transition: { duration: reduce ? 0 : duration, ease: EASE } },
  };

  return (
    <M className={className} style={style} variants={variants}>
      {children}
    </M>
  );
}
