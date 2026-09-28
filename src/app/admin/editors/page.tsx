"use client";

import { useCallback, useEffect, useState } from "react";

import { AdminShell } from "@/components/admin/Shell";
import { useAuth } from "@/components/admin/Auth";

/* ============================================================================
   Editors.

   Anyone signed in may add, rename, re-password or remove an editor. There is
   no second tier of "owner": everyone here can already rewrite every page on
   the site, so a privilege boundary between them would be decoration.

   There is no email on the way out, so there is no reset link to send. An
   editor who is locked out is given a new password by a colleague, which is
   why changing someone else's password is allowed.
   ========================================================================= */

interface Editor {
  id: string;
  email: string;
  name?: string;
  createdAt: string;
  createdBy?: string;
  lastSignInAt?: string;
  weakPassword: boolean;
}

const MIN_PASSWORD = 8;

function when(iso: string | undefined): string {
  if (!iso) return "never";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString("en-CA");
}

export default function EditorsPage() {
  const { api, user } = useAuth();
  const [editors, setEditors] = useState<Editor[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");

  const [changing, setChanging] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");

  const load = useCallback(async () => {
    try {
      const r = await api<{ editors: Editor[] }>("/api/admin/editors");
      setEditors(r.editors);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load the editor list.");
      setEditors([]);
    }
  }, [api]);

  useEffect(() => {
    if (user) void load();
  }, [user, load]);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      await api("/api/admin/editors", {
        method: "POST",
        body: JSON.stringify({ email, name, password }),
      });
      setNotice(`${email} can now sign in.`);
      setEmail("");
      setName("");
      setPassword("");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not add that editor.");
    } finally {
      setBusy(false);
    }
  }

  async function savePassword(id: string) {
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      await api(`/api/admin/editors/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ password: newPassword }),
      });
      setNotice("Password changed.");
      setChanging(null);
      setNewPassword("");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not change that password.");
    } finally {
      setBusy(false);
    }
  }

  async function remove(ed: Editor) {
    if (!window.confirm(`Remove ${ed.email}? They will not be able to sign in again.`)) return;
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      await api(`/api/admin/editors/${ed.id}`, { method: "DELETE" });
      setNotice(`${ed.email} removed.`);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not remove that editor.");
    } finally {
      setBusy(false);
    }
  }

  const weak = (editors ?? []).filter((e) => e.weakPassword);

  return (
    <AdminShell
      title="Editors"
      description="Who can sign in and change the site."
    >
      {error ? <div className="adm__notice adm__notice--error">{error}</div> : null}
      {notice ? <div className="adm__notice adm__notice--ok">{notice}</div> : null}

      {weak.length > 0 ? (
        <div className="adm__notice adm__notice--error">
          <strong>
            {weak.length === 1
              ? "One account has a weak password"
              : `${weak.length} accounts have weak passwords`}
            :
          </strong>{" "}
          {weak.map((e) => e.email).join(", ")}. Anyone who finds this panel can guess
          it, and whoever does can rewrite every page on the site. Change it below.
        </div>
      ) : null}

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ marginBottom: 12 }}>Everyone with access</h2>

        {editors === null ? (
          <p className="adm__empty">Loading…</p>
        ) : editors.length === 0 ? (
          <p className="adm__empty">No editors yet.</p>
        ) : (
          <table className="adm__table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Name</th>
                <th>Added</th>
                <th>Last signed in</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {editors.map((ed) => (
                <tr key={ed.id}>
                  <td>
                    {ed.email}
                    {ed.id === user?.id ? <span className="adm__hint"> — you</span> : null}
                    {ed.weakPassword ? (
                      <div className="adm__marker adm__marker--warning">weak password</div>
                    ) : null}
                  </td>
                  <td>{ed.name ?? <span className="adm__hint">—</span>}</td>
                  <td className="adm__hint">{when(ed.createdAt)}</td>
                  <td className="adm__hint">{when(ed.lastSignInAt)}</td>
                  <td>
                    <div style={{ display: "flex", gap: 4, justifyContent: "flex-end" }}>
                      <button
                        type="button"
                        className="adm__btn adm__btn--sm"
                        onClick={() => {
                          setChanging(changing === ed.id ? null : ed.id);
                          setNewPassword("");
                        }}
                      >
                        {changing === ed.id ? "Cancel" : "Change password"}
                      </button>
                      <button
                        type="button"
                        className="adm__btn adm__btn--sm adm__btn--danger"
                        disabled={busy || ed.id === user?.id}
                        title={
                          ed.id === user?.id
                            ? "You cannot remove the account you are signed in with."
                            : undefined
                        }
                        onClick={() => void remove(ed)}
                      >
                        Remove
                      </button>
                    </div>

                    {changing === ed.id ? (
                      <div style={{ marginTop: 8, display: "flex", gap: 4, justifyContent: "flex-end" }}>
                        <input
                          className="adm__input"
                          type="password"
                          autoComplete="new-password"
                          placeholder={`New password, ${MIN_PASSWORD}+ characters`}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          style={{ maxWidth: 260 }}
                        />
                        <button
                          type="button"
                          className="adm__btn adm__btn--sm adm__btn--primary"
                          disabled={busy || newPassword.length < MIN_PASSWORD}
                          onClick={() => void savePassword(ed.id)}
                        >
                          Save
                        </button>
                      </div>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section style={{ maxWidth: 480 }}>
        <h2 style={{ marginBottom: 12 }}>Add an editor</h2>
        <form onSubmit={add}>
          <div className="adm__field">
            <label className="adm__label" htmlFor="ed-email">
              Email
            </label>
            <input
              id="ed-email"
              className="adm__input"
              type="email"
              autoComplete="off"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="adm__field">
            <label className="adm__label" htmlFor="ed-name">
              Name
            </label>
            <input
              id="ed-name"
              className="adm__input"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <p className="adm__hint">Optional. Shown beside their edits.</p>
          </div>

          <div className="adm__field">
            <label className="adm__label" htmlFor="ed-pw">
              Password
            </label>
            <input
              id="ed-pw"
              className="adm__input"
              type="password"
              autoComplete="new-password"
              required
              minLength={MIN_PASSWORD}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <p className="adm__hint">
              At least {MIN_PASSWORD} characters. Tell them in person or over something
              other than email, and have them change it once they are in.
            </p>
          </div>

          <button
            type="submit"
            className="adm__btn adm__btn--primary"
            disabled={busy || password.length < MIN_PASSWORD || !email}
          >
            {busy ? "Adding…" : "Add editor"}
          </button>
        </form>
      </section>
    </AdminShell>
  );
}
