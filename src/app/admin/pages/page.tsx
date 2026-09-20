"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { AdminShell, FindingCount } from "@/components/admin/Shell";
import { useAuth } from "@/components/admin/Auth";
import type { Finding } from "@/lib/brandCheck";

interface Row {
  slug: string;
  name: string;
  sections: number;
  updatedAt: string | null;
  updatedBy: string | null;
  findings: Finding[];
}

function docId(slug: string) {
  return slug === "" ? "home" : slug.replace(/\//g, "__");
}

export default function PagesList() {
  const { api, user } = useAuth();
  const [rows, setRows] = useState<Row[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    api<{ pages: Row[] }>("/api/admin/pages")
      .then((r) => setRows(r.pages))
      .catch((e) => {
        setError(e instanceof Error ? e.message : "Could not load.");
        setRows([]);
      });
  }, [api, user]);

  return (
    <AdminShell
      title="Pages"
      description="Eleven pages. The architecture is calibrated and is not to be expanded."
    >
      {error ? <div className="adm__notice adm__notice--error">{error}</div> : null}

      {rows === null ? (
        <p className="adm__empty">Loading…</p>
      ) : (
        <table className="adm__table">
          <thead>
            <tr>
              <th>Page</th>
              <th>Address</th>
              <th className="num">Sections</th>
              <th>Checks</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.slug}>
                <td>
                  <Link href={`/admin/pages/${docId(r.slug)}`}>{r.name}</Link>
                </td>
                <td className="adm__hint">/{r.slug}</td>
                <td className="num">{r.sections}</td>
                <td>
                  <FindingCount findings={r.findings} />
                </td>
                <td style={{ textAlign: "right" }}>
                  <a
                    className="adm__btn adm__btn--sm"
                    href={`/${r.slug}`}
                    target="_blank"
                    rel="noreferrer noopener"
                  >
                    View
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </AdminShell>
  );
}
