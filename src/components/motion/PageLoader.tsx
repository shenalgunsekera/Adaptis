"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import { AdaptisLockup } from "@/components/brand/Lockup";
import { boot } from "@/lib/boot";

/* ============================================================================
   Page loader.

   An Ink curtain on every full page load: the lockup settles in, the closing
   one-liner arrives, a counter runs to 100 against a Naples hairline, and the
   curtain lifts.

   On brand: the ground is flat Ink, not a gradient; the texture is the
   module lattice already used on the hero; the only colour is the single
   Naples form, here the progress rule. Nothing rotates and nothing casts a
   shadow.

   It renders in the server HTML so it is on screen from the first paint
   rather than flashing the page first, and CSS hides it outright under
   prefers-reduced-motion, before hydration can run.
   ========================================================================= */

const EASE_EXPO: [number, number, number, number] = [0.16, 1, 0.3, 1];
const DURATION = 1150;

export function PageLoader({ line }: { line: string }) {
  const reduce = useReducedMotion();
  const [phase, setPhase] = useState<"loading" | "done">(() =>
    boot.done ? "done" : "loading"
  );
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (reduce) {
      boot.done = true;
      setPhase("done");
      return;
    }

    // Settled in the initialiser above; nothing to do on a navigation.
    if (boot.done) return;

    document.documentElement.style.overflow = "hidden";
    const start = performance.now();
    let raf = 0;
    let settle: number | undefined;

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / DURATION);
      // Ease-out-expo, so the count surges and then settles.
      const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
      setProgress(Math.round(eased * 100));
      if (t < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        settle = window.setTimeout(() => {
          boot.done = true;
          setPhase("done");
        }, 180);
      }
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      if (settle) window.clearTimeout(settle);
      document.documentElement.style.overflow = "";
    };
  }, [reduce]);

  useEffect(() => {
    if (phase === "done") document.documentElement.style.overflow = "";
  }, [phase]);

  return (
    <AnimatePresence>
      {phase === "loading" ? (
        <motion.div
          key="loader"
          className="loader"
          aria-hidden="true"
          initial={{ opacity: 1 }}
          exit={{ y: "-100%" }}
          transition={{ duration: 0.8, ease: EASE_EXPO }}
        >
          <div className="loader__grid" />

          <div className="loader__brand">
            <AdaptisLockup
              height={30}
              markFill="var(--brand-naples)"
              wordmarkFill="var(--neutral-card)"
            />
          </div>

          <p className="loader__line">{line}</p>

          <div className="loader__foot">
            <div className="loader__rule">
              <div className="loader__fill" style={{ width: `${progress}%` }} />
            </div>
            <span className="loader__count numeric">
              {progress}
              <span className="loader__pct">%</span>
            </span>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
