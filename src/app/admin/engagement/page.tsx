"use client";

import { useCallback, useEffect, useState } from "react";

import { AdminShell } from "@/components/admin/Shell";
import { useAuth } from "@/components/admin/Auth";
import type { Engagement } from "@/lib/types";

/* ============================================================================
   Engagement.

   Counts only: views per page per day, and how many readers went on to make
   contact. No cookie is set and nothing identifying is stored, so there is
   nothing here to consent to and nothing to hand to a third party.

   Charted with hairline bars rather than a library — the product rules ask
   for "summary stats as a hairline-separated row of figures, not colored
   tiles", and a bar chart of one series does not need a dependency.
   ========================================================================= */

const WINDOWS = [7, 30, 90];

export default function EngagementPage() {
  const { api, user } = useAuth();
  const [data, setData] = useState<Engagement | null>(null);
  const [days, setDays] = useState(30);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (window: number) => {
      try {
        const r = await api<{ engagement: Engagement }>(`/api/admin/engagement?days=${window}`);
        setData(r.engagement);
        setError(null);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not load.");
        setData(null);
      }
    },
    [api]
  );

  useEffect(() => {
    if (user) void load(days);
  }, [user, days, load]);

  const peak = data ? Math.max(1, ...data.days.map((d) => d.views)) : 1;
  const empty = data && data.totals.views === 0;

  return (
    <AdminShell
      title="Engagement"
      description="Views and enquiries. No cookies, no identifiers, nothing about the reader."
      actions={
        <div style={{ display: "flex", gap: 4 }}>
          {WINDOWS.map((w) => (
            <button
              key={w}
              type="button"
              className={`adm__btn adm__btn--sm${w === days ? " adm__btn--primary" : ""}`}
              onClick={() => setDays(w)}
            >
              {w} days
            </button>
          ))}
        </div>
      }
    >
      {error ? <div className="adm__notice adm__notice--error">{error}</div> : null}

      {!data ? (
        <p className="adm__empty">Loading…</p>
      ) : empty ? (
        <div className="adm__notice">
          Nothing recorded yet. Views are counted once Firestore is connected and the
          site has had its first visitor; this screen fills in from there.
        </div>
      ) : (
        <>
          <div className="adm__stats" style={{ marginBottom: 32 }}>
            <div className="adm__stat">
              <div className="adm__stat__v">{data.totals.views.toLocaleString("en-CA")}</div>
              <div className="adm__stat__l">Page views</div>
            </div>
            <div className="adm__stat">
              <div className="adm__stat__v">{data.totals.enquiries.toLocaleString("en-CA")}</div>
              <div className="adm__stat__l">Enquiries</div>
            </div>
            <div className="adm__stat">
              <div className="adm__stat__v">{data.totals.conversion}%</div>
              <div className="adm__stat__l">Views that became an enquiry</div>
            </div>
            <div className="adm__stat">
              <div className="adm__stat__v">
                {data.days.length ? Math.round(data.totals.views / data.days.length) : 0}
              </div>
              <div className="adm__stat__l">Views a day, on average</div>
            </div>
          </div>

          <section style={{ marginBottom: 32 }}>
            <h2 style={{ marginBottom: 12 }}>Views a day</h2>
            <div className="adm__chart" role="img" aria-label={`Daily views over the last ${days} days`}>
              {data.days.map((d) => (
                <div key={d.id} className="adm__bar-wrap" title={`${d.id}: ${d.views} views, ${d.enquiries} enquiries`}>
                  <div className="adm__bar" style={{ height: `${(d.views / peak) * 100}%` }} />
                  {d.enquiries > 0 ? <span className="adm__bar-dot" /> : null}
                </div>
              ))}
            </div>
            <p className="adm__hint" style={{ marginTop: 8 }}>
              {data.days[0]?.id} to {data.days.at(-1)?.id}. A marker under a bar is a day
              that produced at least one enquiry.
            </p>
          </section>

          <section>
            <h2 style={{ marginBottom: 12 }}>Most read</h2>
            <table className="adm__table">
              <thead>
                <tr>
                  <th>Page</th>
                  <th className="num">Views</th>
                  <th className="num">Share</th>
                </tr>
              </thead>
              <tbody>
                {data.topPages.map((p) => (
                  <tr key={p.path}>
                    <td>
                      <a href={p.path} target="_blank" rel="noreferrer noopener">
                        {p.path}
                      </a>
                    </td>
                    <td className="num">{p.views.toLocaleString("en-CA")}</td>
                    <td className="num">
                      {data.totals.views ? Math.round((p.views / data.totals.views) * 100) : 0}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </>
      )}
    </AdminShell>
  );
}
