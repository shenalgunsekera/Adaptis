"use client";

import { useCallback, useEffect, useState } from "react";

import { AdminShell } from "@/components/admin/Shell";
import { useAuth } from "@/components/admin/Auth";
import type { ContactSubmission } from "@/lib/types";

/* ============================================================================
   Enquiries.

   Every submission is written to Firestore before the notification is sent,
   so nothing is lost to a mail failure. Where mail did fail, the error is
   shown against the enquiry rather than hidden.
   ========================================================================= */

export default function Inbox() {
  const { api, user } = useAuth();
  const [rows, setRows] = useState<ContactSubmission[] | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [showArchived, setShowArchived] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const r = await api<{ submissions: ContactSubmission[] }>("/api/admin/submissions");
      setRows(r.submissions);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load the inbox.");
      setRows([]);
    }
  }, [api]);

  useEffect(() => {
    if (user) void load();
  }, [user, load]);

  /* Arriving from the "I'll take this one" button in the notification email.
     The claim happens here rather than at a link the mail client can open,
     because a mail client, a scanner or a link preview will fetch a URL
     without anyone deciding to: claiming has to follow a signed-in session
     and a real page load, not a GET from whatever opened the message.

     The parameter is cleared afterwards so a refresh does not re-run it. */
  useEffect(() => {
    if (!user || rows === null) return;

    const wanted = new URLSearchParams(window.location.search).get("claim");
    if (!wanted) return;

    window.history.replaceState({}, "", window.location.pathname);
    setSelected(wanted);

    const row = rows.find((r) => r.id === wanted);
    if (!row) {
      setError("That enquiry is no longer in the inbox.");
      return;
    }
    if (row.claimedBy === user.id) {
      setNotice("You already had this one.");
      return;
    }
    if (row.claimedBy) {
      setError(
        `${row.claimedByName || row.claimedByEmail} is already handling this one. Talk to them rather than both replying.`
      );
      return;
    }
    void claim(wanted);
    // Runs on the first load that has both a session and the rows; `claim`
    // and the setters are stable enough that re-running on every render would
    // only re-claim what is already claimed.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, rows === null]);

  async function patch(id: string, body: Record<string, unknown>) {
    await api("/api/admin/submissions", { method: "PATCH", body: JSON.stringify({ id, ...body }) });
    await load();
  }

  /** Says "I have this" to the other editors. The server settles two
      simultaneous claims and tells the loser who got there first, so the
      refusal is worth surfacing rather than swallowing. */
  async function claim(id: string, release = false) {
    setError(null);
    setNotice(null);
    try {
      await api("/api/admin/submissions/claim", {
        method: "POST",
        body: JSON.stringify({ id, release }),
      });
      setNotice(
        release
          ? "Handed back. It is open for anyone again."
          : "Yours. The other editors have been told, in the enquiry's own email thread."
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not claim that enquiry.");
    }
    await load();
  }

  async function remove(id: string) {
    if (!window.confirm("Delete this enquiry permanently? This cannot be undone.")) return;
    await api(`/api/admin/submissions?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    if (selected === id) setSelected(null);
    await load();
  }

  const visible = (rows ?? []).filter((r) => (showArchived ? true : !r.archived));
  const unread = (rows ?? []).filter((r) => !r.read && !r.archived).length;
  const current = visible.find((r) => r.id === selected) ?? null;

  return (
    <AdminShell
      title="Enquiries"
      description={rows === null ? undefined : `${unread} unread of ${visible.length} shown.`}
      actions={
        <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <input
            type="checkbox"
            checked={showArchived}
            onChange={(e) => setShowArchived(e.target.checked)}
          />
          <span className="adm__label" style={{ margin: 0 }}>
            Include archived
          </span>
        </label>
      }
    >
      {error ? <div className="adm__notice adm__notice--error">{error}</div> : null}
      {notice ? <div className="adm__notice adm__notice--ok">{notice}</div> : null}

      {rows === null ? (
        <p className="adm__empty">Loading…</p>
      ) : visible.length === 0 ? (
        <p className="adm__empty">
          No enquiries yet. Submissions from the contact form arrive here, and a copy is emailed.
        </p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr)", gap: 28 }}>
          <table className="adm__table">
            <thead>
              <tr>
                <th>From</th>
                <th>Organization</th>
                <th>Working on</th>
                <th>Received</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {visible.map((r) => (
                <tr key={r.id} data-selected={r.id === selected}>
                  <td>
                    <button
                      type="button"
                      className="adm__btn adm__btn--quiet adm__btn--sm"
                      style={{ padding: 0, fontWeight: r.read ? 400 : 600 }}
                      onClick={() => {
                        setSelected(r.id === selected ? null : r.id);
                        if (!r.read) void patch(r.id, { read: true });
                      }}
                    >
                      {r.name}
                    </button>
                    <div className="adm__hint">{r.email}</div>
                    {r.mailError ? (
                      <div className="adm__marker adm__marker--warning" style={{ marginTop: 4 }}>
                        Notification email failed
                      </div>
                    ) : null}
                    {r.claimedBy ? (
                      <div className="adm__marker" style={{ marginTop: 4 }}>
                        {r.claimedBy === user?.id
                          ? "You are handling this"
                          : `${r.claimedByName || r.claimedByEmail} is handling this`}
                      </div>
                    ) : null}
                  </td>
                  <td>{r.organization || "—"}</td>
                  <td>{r.subject || "—"}</td>
                  <td className="adm__hint">
                    {new Date(r.createdAt).toLocaleString("en-CA", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </td>
                  <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                    {!r.claimedBy ? (
                      <>
                        <button
                          type="button"
                          className="adm__btn adm__btn--sm"
                          onClick={() => void claim(r.id)}
                        >
                          I&rsquo;ll take this
                        </button>{" "}
                      </>
                    ) : r.claimedBy === user?.id ? (
                      <>
                        <button
                          type="button"
                          className="adm__btn adm__btn--quiet adm__btn--sm"
                          onClick={() => void claim(r.id, true)}
                        >
                          Hand back
                        </button>{" "}
                      </>
                    ) : null}
                    <a className="adm__btn adm__btn--sm" href={`mailto:${r.email}`}>
                      Reply
                    </a>{" "}
                    <button
                      type="button"
                      className="adm__btn adm__btn--quiet adm__btn--sm"
                      onClick={() => void patch(r.id, { archived: !r.archived })}
                    >
                      {r.archived ? "Restore" : "Archive"}
                    </button>{" "}
                    <button
                      type="button"
                      className="adm__btn adm__btn--danger adm__btn--sm"
                      onClick={() => void remove(r.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {current ? (
            <section>
              <h2 style={{ marginBottom: 4 }}>{current.name}</h2>
              <p className="adm__hint" style={{ marginBottom: 16 }}>
                {current.organization ? `${current.organization} · ` : ""}
                <a href={`mailto:${current.email}`}>{current.email}</a>
                {current.subject ? ` · ${current.subject}` : ""}
              </p>

              <div
                style={{
                  borderLeft: "3px solid var(--naples)",
                  paddingLeft: 16,
                  whiteSpace: "pre-wrap",
                  fontSize: 14,
                  lineHeight: 1.65,
                }}
              >
                {current.message}
              </div>

              {current.mailError ? (
                <div className="adm__notice adm__notice--warn" style={{ marginTop: 16 }}>
                  The notification email did not send: {current.mailError}. The enquiry itself is
                  safe — it is stored here.
                </div>
              ) : null}
            </section>
          ) : null}
        </div>
      )}
    </AdminShell>
  );
}
