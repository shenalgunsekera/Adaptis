import Link from "next/link";

import { AdaptisLockup } from "@/components/brand/Lockup";
import type { SiteSettings } from "@/lib/types";

/* ============================================================================
   Footer — Halite, the single cool close on every page.

   Halite is scarce by rule: roughly once per document. It appears here and
   nowhere else on the site. Its retinue is the cool family only, so nothing
   warm follows it: no Naples, no Apricot, no warm ramp. Secondary text is
   Cassiopeia at 8.08:1; the lockup takes the cool two-tone.

   The section immediately above this one must be light. The two darks measure
   1.05:1 against each other and never touch.
   ========================================================================= */

export function Footer({ settings }: { settings: SiteSettings }) {
  const f = settings.footer;

  return (
    <footer className="on-halite footer">
      <div className="wrap">
        <div className="footer__grid">
          <div className="footer__brand">
            <Link href="/" aria-label="Adaptis, home">
              <AdaptisLockup
                height={32}
                markFill="var(--brand-cassiopeia)"
                wordmarkFill="var(--neutral-card)"
              />
            </Link>
            <p className="footer__line">{f.line}</p>
          </div>

          {f.columns.map((col) => (
            <nav key={col.id} aria-label={col.title}>
              <h2 className="footer__h">{col.title}</h2>
              <ul className="footer__list">
                {col.links.map((link) => (
                  <li key={link.id}>
                    <Link href={link.href}>{link.label}</Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          <div>
            <h2 className="footer__h">{settings.legalName}</h2>
            <div className="footer__contact">
              <address>
                {f.address.map((line) => (
                  <span key={line} style={{ display: "block" }}>
                    {line}
                  </span>
                ))}
              </address>
              <a href={`mailto:${f.email}`}>{f.email}</a>
              <a href={`tel:${f.phone.replace(/\s/g, "")}`}>{f.phone}</a>
              <a href={f.linkedin} target="_blank" rel="noreferrer noopener">
                LinkedIn
              </a>
            </div>
          </div>
        </div>

        <div className="footer__bottom">
          <span>{f.copyright}</span>
          <span>{f.closingLine}</span>
        </div>
      </div>
    </footer>
  );
}
