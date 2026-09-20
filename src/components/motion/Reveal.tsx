"use client";

import { type ReactNode } from "react";
import { motion, useReducedMotion, type Variants } from "motion/react";

/* ============================================================================
   In-view reveals.

   The brand bars shadows, gradients, depth effects and rotation. None of
   those are motion rules, and nothing here breaks them: these animate
   opacity and a small translation only, so a section arrives rather than
   performs. Distances stay under 30px and durations under a second.

   prefers-reduced-motion is honoured by rendering the content static, not by
   playing a shorter animation.
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
  const v = kinds[kind];

  if (reduce) {
    const Static = as;
    return (
      <Static className={className} style={style}>
        {children}
      </Static>
    );
  }

  const M = motion[as] as typeof motion.div;
  return (
    <M
      className={className}
      style={style}
      initial={v.hidden}
      whileInView={v.shown}
      viewport={{ once: true, amount, margin: "0px 0px -8% 0px" }}
      transition={{ duration, delay, ease: EASE }}
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
  const M = motion[as as Tag] as typeof motion.div;

  const container: Variants = {
    hidden: {},
    shown: { transition: { staggerChildren: reduce ? 0 : stagger, delayChildren } },
  };

  return (
    <M
      className={className}
      style={style}
      variants={container}
      initial="hidden"
      whileInView="shown"
      viewport={{ once: true, amount, margin: "0px 0px -8% 0px" }}
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
