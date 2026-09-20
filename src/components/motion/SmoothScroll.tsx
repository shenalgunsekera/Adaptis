"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import { motion, useScroll, useSpring } from "motion/react";

/* ============================================================================
   Smooth scrolling, and the reading-progress hairline.

   Both are off entirely under prefers-reduced-motion: Lenis is never
   constructed, so native scrolling is untouched.
   ========================================================================= */

export function SmoothScroll() {
  const lenisRef = useRef<Lenis | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      anchors: true,
    });
    lenisRef.current = lenis;

    // Images arriving late change the page height; refresh the scroll limit.
    const onLoad = () => lenis.resize();
    window.addEventListener("load", onLoad);

    let raf = 0;
    const tick = (time: number) => {
      lenis.raf(time);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("load", onLoad);
      cancelAnimationFrame(raf);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  // Lenis keeps its own offset, so without this a new page would inherit the
  // previous one's scroll position.
  useEffect(() => {
    const t = setTimeout(() => {
      const lenis = lenisRef.current;
      const hash = window.location.hash;
      const target = hash ? document.querySelector(hash) : null;

      if (target) {
        if (lenis) lenis.scrollTo(target as HTMLElement, { immediate: true });
        else (target as HTMLElement).scrollIntoView();
        return;
      }
      if (lenis) lenis.scrollTo(0, { immediate: true });
      else window.scrollTo(0, 0);
    }, 0);
    return () => clearTimeout(t);
  }, [pathname]);

  return null;
}

/** A Naples hairline across the top, showing how far down the page you are. */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 24,
    restDelta: 0.001,
  });

  return <motion.div aria-hidden="true" className="progress" style={{ scaleX }} />;
}
