"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

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

export default function Overview() {
  const { api, user } = useAuth();
  const [rows, setRows] = useState<Row[] | null>(null);
  const [unread, setUnread] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [seeding, setSeeding] = useState(false);

  const load = useCallback(async () => {
    try {
      const [pages, inbox] = await Promise.all([
        api<{ pages: Row[] }>("/api/admin/pages"),
        api<{ submissions: { read: boolean }[] }>("/api/admin/submissions").catch(() => ({
          submissions: [],
        })),
      ]);
      setRows(pages.pages);
      setUnread(inbox.submissions.filter((s) => !s.read).length);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load.");
      setRows([]);
    }
  }, [api]);

  useEffect(() => {
    if (user) void load();
  }, [user, load]);

  async function seed(overwrite: boolean) {
    const question = overwrite
      ? "Replace every page with the copy that was signed off? Any edits made here will be lost."
      : "Load the shipped copy into any page that is still empty?";
    if (!window.confirm(question)) return;

    setSeeding(true);
    setNotice(null);
    try {
      const res = await api<{ written: string[]; skipped: string[] }>(
        `/api/admin/seed${overwrite ? "?overwrite=1" : ""}`,
        { method: "POST" }
      );
      setNotice(
        `Wrote ${res.written.length} document(s)${
          res.skipped.length ? `, left ${res.skipped.length} untouched` : ""
        }.`
      );
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "The seed failed.");
    } finally {
      setSeeding(false);
    }
  }

  const all = rows?.flatMap((r) => r.findings) ?? [];
  const errors = all.filter((f) => f.severity === "error").length;
  const warnings = all.filter((f) => f.severity === "warning").length;
  const notes = all.filter((f) => f.severity === "note").length;

  return (
    <AdminShell
      title="Overview"
      description="Everything on the site, and everything still outstanding."
      actions={
        <>
          <button type="button" className="adm__btn" disabled={seeding} onClick={() => void seed(false)}>
            Fill empty pages
          </button>
          <button
            type="button"
            className="adm__btn adm__btn--danger"
            disabled={seeding}
            onClick={() => void seed(true)}
          >
            Reset to shipped copy
          </button>
        </>
      }
    >
      {error ? <div className="adm__notice adm__notice--error">{error}</div> : null}
      {notice ? <div className="adm__notice adm__notice--ok">{notice}</div> : null}

      <div className="adm__stats" style={{ marginBottom: 32 }}>
        <div className="adm__stat">
          <div className="adm__stat__v">{rows?.length ?? "—"}</div>
          <div className="adm__stat__l">Pages</div>
        </div>
        <div className={`adm__stat${errors ? " adm__hatch" : ""}`}>
          <div className="adm__stat__v">{errors}</div>
          <div className="adm__stat__l">Brand rules broken</div>
        </div>
        <div className="adm__stat">
          <div className="adm__stat__v">{warnings}</div>
          <div className="adm__stat__l">Worth a look</div>
        </div>
        <div className="adm__stat">
          <div className="adm__stat__v">{notes}</div>
          <div className="adm__stat__l">Outstanding before launch</div>
        </div>
        <div className="adm__stat">
          <div className="adm__stat__v">{unread ?? "—"}</div>
          <div className="adm__stat__l">Unread enquiries</div>
        </div>
      </div>

      <h2 style={{ marginBottom: 12 }}>Pages</h2>

      {rows === null ? (
        <p className="adm__empty">Loading…</p>
      ) : rows.length === 0 ? (
        <p className="adm__empty">
          No pages yet. Use “Fill empty pages” above to load the copy that was signed off.
        </p>
      ) : (
        <table className="adm__table">
          <thead>
            <tr>
              <th>Page</th>
              <th>Address</th>
              <th className="num">Sections</th>
              <th>Checks</th>
              <th>Last edited</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.slug}>
                <td>
                  <Link href={`/admin/pages/${r.slug === "" ? "home" : r.slug.replace(/\//g, "__")}`}>
                    {r.name}
                  </Link>
                </td>
                <td className="adm__hint">/{r.slug}</td>
                <td className="num">{r.sections}</td>
                <td>
                  <FindingCount findings={r.findings} />
                </td>
                <td className="adm__hint">
                  {r.updatedAt ? (
                    <>
                      {new Date(r.updatedAt).toLocaleDateString("en-CA")}
                      {r.updatedBy ? <br /> : null}
                      {r.updatedBy}
                    </>
                  ) : (
                    "Shipped copy"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </AdminShell>
  );
}
