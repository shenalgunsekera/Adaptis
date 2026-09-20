"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionTemplate,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";

import { AdaptisLockup } from "@/components/brand/Lockup";
import type { NavItem, SiteSettings } from "@/lib/types";

/* ============================================================================
   Header — the Scion top bar.

   The logo, four nav items and one call to action. At the top of the page the
   bar has no ground of its own and sits straight on the hero photograph; as
   the page scrolls its ground fades in and it draws into a rounded inset bar,
   on the same curve as the hero board below it.

   The five areas of work hang off "What we do" as a dropdown rather than a
   second sticky band. A band under the bar meant two stacked dark strips on
   every pillar page, and it had nothing to sit on once the page ground went
   light.
   ========================================================================= */

function isCurrent(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

export function Header({
  settings,
}: {
  settings: SiteSettings;
  /** Retained for callers; the sub-navigation band no longer renders. */
  subnavAccent?: string;
}) {
  const pathname = usePathname() || "/";
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState<string | null>(null);
  const reduce = useReducedMotion();
  const closeTimer = useRef<number | null>(null);

  /* The bar forms on scroll, over the same distance and on the same curve as
     the hero board, so the two read as one gesture.

     It stays welded to the top edge of the viewport: only the sides draw in
     and only the bottom corners round, so the bar reads as hanging from the
     top rather than floating with a gap above it. */
  const { scrollY } = useScroll();
  const eased = useSpring(scrollY, { stiffness: 120, damping: 28, restDelta: 0.5 });
  const insetRaw = useTransform(eased, [0, 340], [0, 14], { clamp: true });
  const radiusRaw = useTransform(eased, [0, 340], [0, 16], { clamp: true });
  const inset = useMotionTemplate`${insetRaw}px`;
  const radius = useMotionTemplate`${radiusRaw}px`;

  /* At the top of the page the bar has no ground of its own: the logo, the
     links and the call to action sit straight on the photograph. The ground
     fades in as you scroll, so the bar arrives rather than sitting there as a
     black strip across the image. */
  /* The ground arrives quickly — within the first 90px — because anything
     slower lets the page scroll visibly through the bar. The inset and the
     radius take the longer curve; only the ground is in a hurry. */
  const background = useTransform(
    eased,
    [0, 18, 90],
    ["rgba(51, 51, 44, 0)", "rgba(51, 51, 44, 0.80)", "rgba(51, 51, 44, 1)"]
  );

  const barStyle = reduce
    ? { background: "var(--brand-ink)" }
    : {
        marginInline: inset,
        borderBottomLeftRadius: radius,
        borderBottomRightRadius: radius,
        background,
      };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
    setMenu(null);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpen(false);
      setMenu(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  /* A small delay on close so the pointer can cross the gap between the nav
     item and the panel without the menu snapping shut. */
  function openMenu(id: string) {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    setMenu(id);
  }
  function scheduleClose() {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => setMenu(null), 140);
  }

  const areas = settings.subnav;

  return (
    <>
      <header className={`header${scrolled ? " header--scrolled" : ""}`}>
        <motion.div className="header__bar" style={barStyle}>
          <div className="header__inner">
            <Link href="/" className="header__logo" aria-label="Adaptis, home">
              <AdaptisLockup height={30} markFill="var(--brand-naples)" wordmarkFill="var(--neutral-card)" />
            </Link>

            <nav className="header__nav" aria-label="Primary">
              {settings.nav.map((item: NavItem) => {
                const hasMenu = item.href === "/what-we-do" && areas.length > 0;
                const active = isCurrent(pathname, item.href);

                if (!hasMenu) {
                  return (
                    <Link
                      key={item.id}
                      href={item.href}
                      className="navlink"
                      data-active={active}
                      aria-current={active ? "page" : undefined}
                    >
                      {item.label}
                    </Link>
                  );
                }

                return (
                  <div
                    key={item.id}
                    className="navitem"
                    onMouseEnter={() => openMenu(item.id)}
                    onMouseLeave={scheduleClose}
                    onFocusCapture={() => openMenu(item.id)}
                    onBlurCapture={scheduleClose}
                  >
                    <Link
                      href={item.href}
                      className="navlink navlink--menu"
                      data-active={active}
                      aria-current={active ? "page" : undefined}
                      aria-expanded={menu === item.id}
                      aria-haspopup="true"
                    >
                      {item.label}
                      <span className="navlink__mark" aria-hidden="true" />
                    </Link>

                    <AnimatePresence>
                      {menu === item.id ? (
                        <motion.div
                          className="navmenu"
                          initial={reduce ? false : { opacity: 0, y: -6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={reduce ? undefined : { opacity: 0, y: -6 }}
                          transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                        >
                          <p className="navmenu__label">Five areas, one engagement</p>
                          {areas.map((area) => (
                            <Link
                              key={area.id}
                              href={area.href}
                              className="navmenu__link"
                              data-active={isCurrent(pathname, area.href)}
                            >
                              {area.label}
                            </Link>
                          ))}
                        </motion.div>
                      ) : null}
                    </AnimatePresence>
                  </div>
                );
              })}
            </nav>

            <div className="header__right">
              <Link href={settings.ctaHref} className="header__cta">
                {settings.ctaLabel}
              </Link>
              <button
                type="button"
                className="burger"
                aria-expanded={open}
                aria-controls="site-drawer"
                aria-label={open ? "Close menu" : "Open menu"}
                onClick={() => setOpen((v) => !v)}
              >
                <span />
              </button>
            </div>
          </div>
        </motion.div>
      </header>

      {open ? (
        <div className="drawer on-ink" id="site-drawer">
          {settings.nav.map((item) => (
            <div key={item.id}>
              <Link href={item.href} aria-current={isCurrent(pathname, item.href) ? "page" : undefined}>
                {item.label}
              </Link>
              {item.href === "/what-we-do"
                ? areas.map((area) => (
                    <Link key={area.id} href={area.href} className="drawer__sub">
                      {area.label}
                    </Link>
                  ))
                : null}
            </div>
          ))}
          <Link href={settings.ctaHref} className="btn btn--oncard">
            {settings.ctaLabel}
          </Link>
        </div>
      ) : null}
    </>
  );
}
