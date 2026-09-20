"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { AdaptisWordmark } from "@/components/brand/Lockup";
import { SignIn, useAuth } from "./Auth";
import type { Finding, Severity } from "@/lib/brandCheck";

/* ============================================================================
   Admin shell: the dark rail and the working surface.

   The rail is the one registered exception to colorless chrome, and only at
   rail width. Card wordmark, Cassiopeia secondary text, and an active item
   marked by a 4px Cassiopeia edge with a 20 per cent lift at band height.
   ========================================================================= */

const NAV = [
  { href: "/admin", label: "Overview", exact: true },
  { href: "/admin/pages", label: "Pages" },
  { href: "/admin/settings", label: "Navigation and footer" },
  { href: "/admin/inbox", label: "Enquiries" },
];

export function AdminShell({
  title,
  description,
  actions,
  children,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  const { user, loading, signOutNow } = useAuth();
  const pathname = usePathname() || "";

  if (loading) {
    return (
      <div className="adm">
        <div className="adm__signin">
          <p className="adm__sub">Checking your session…</p>
        </div>
      </div>
    );
  }

  if (!user) return <SignIn />;

  return (
    <div className="adm">
      <div className="adm__frame">
        <nav className="adm__rail" aria-label="Admin">
          <div className="adm__railbrand">
            {/* Product rail identity: the Card wordmark at the 18px cap floor. */}
            <AdaptisWordmark cap={19} fill="#FFFDF9" title="Adaptis admin" />
          </div>

          <div className="adm__railnav">
            {NAV.map((item) => {
              const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
              return (
                <Link key={item.href} href={item.href} className="adm__railitem" data-active={active}>
                  {item.label}
                </Link>
              );
            })}
            <a
              className="adm__railitem"
              href="/"
              target="_blank"
              rel="noreferrer noopener"
            >
              View the site
            </a>
          </div>

          <div className="adm__railfoot">
            <p className="adm__railuser">{user.email}</p>
            <button
              type="button"
              className="adm__btn adm__btn--sm"
              style={{ marginTop: 10, background: "transparent", borderColor: "rgba(174,208,201,.4)", color: "#FFFDF9" }}
              onClick={() => void signOutNow()}
            >
              Sign out
            </button>
          </div>
        </nav>

        <div className="adm__main">
          <header className="adm__head">
            <div>
              <h1>{title}</h1>
              {description ? <p className="adm__sub">{description}</p> : null}
            </div>
            {actions ? <div className="adm__section__tools">{actions}</div> : null}
          </header>

          <div className="adm__body">{children}</div>
        </div>
      </div>
    </div>
  );
}

/* --- Findings list --------------------------------------------------------- */

const severityLabel: Record<Severity, string> = {
  error: "Breaks a rule",
  warning: "Worth a look",
  note: "Before launch",
};

export function Findings({ findings }: { findings: Finding[] }) {
  if (findings.length === 0) {
    return (
      <p className="adm__marker adm__marker--ok" style={{ padding: "12px 0" }}>
        Every brand and accessibility check passes.
      </p>
    );
  }

  return (
    <div className="adm__findings">
      {findings.map((f, i) => (
        <div key={i} className="adm__finding">
          <div>
            <span className={`adm__marker adm__marker--${f.severity}`}>{severityLabel[f.severity]}</span>
            <p className="adm__finding__rule" style={{ marginTop: 4 }}>
              {f.rule}
            </p>
          </div>
          <p className="adm__finding__msg">{f.message}</p>
        </div>
      ))}
    </div>
  );
}

export function FindingCount({ findings }: { findings: Finding[] }) {
  const errors = findings.filter((f) => f.severity === "error").length;
  const warnings = findings.filter((f) => f.severity === "warning").length;
  const notes = findings.filter((f) => f.severity === "note").length;

  if (errors) {
    return (
      <span className="adm__marker adm__marker--error">
        {errors} {errors === 1 ? "rule broken" : "rules broken"}
      </span>
    );
  }
  if (warnings) {
    return <span className="adm__marker adm__marker--warning">{warnings} to look at</span>;
  }
  if (notes) {
    return <span className="adm__marker adm__marker--note">{notes} before launch</span>;
  }
  return <span className="adm__marker adm__marker--ok">Clear</span>;
}
