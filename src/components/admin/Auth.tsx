"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { AdaptisLockup } from "@/components/brand/Lockup";

/* ============================================================================
   Admin session.

   Email and password held by this application. Signing in sets a signed,
   HttpOnly cookie that the browser cannot read and that every admin route
   checks against the account store, so the client holds no authority of its
   own and a tampered cookie fails its signature.

   No identity provider is involved, which is what lets the panel work without
   a Google credential. Pages still live in Firestore, so editing them needs
   one; signing in and managing editors does not.
   ========================================================================= */

export interface AdminUser {
  id: string;
  email: string;
  name?: string;
}

interface AuthValue {
  user: AdminUser | null;
  loading: boolean;
  error: string | null;
  /** True while the signed-in account still has the password it shipped with. */
  weakPassword: boolean;
  sessionSecretSet: boolean;
  refresh: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOutNow: () => Promise<void>;
  api: <T = unknown>(path: string, init?: RequestInit) => Promise<T>;
}

const Ctx = createContext<AuthValue | null>(null);

export function useAuth(): AuthValue {
  const value = useContext(Ctx);
  if (!value) throw new Error("useAuth must be used inside AdminAuthProvider.");
  return value;
}

export class ApiError extends Error {
  status: number;
  payload: unknown;
  constructor(message: string, status: number, payload: unknown) {
    super(message);
    this.status = status;
    this.payload = payload;
  }
}

interface MeResponse {
  user: AdminUser | null;
  weakPassword?: boolean;
  sessionSecretSet?: boolean;
}

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [weakPassword, setWeakPassword] = useState(false);
  const [sessionSecretSet, setSessionSecretSet] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/auth/me", { cache: "no-store" });
      const data = (await res.json()) as MeResponse;
      setUser(data.user);
      setWeakPassword(Boolean(data.weakPassword));
      setSessionSecretSet(data.sessionSecretSet !== false);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      setError(null);
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const payload = (await res.json().catch(() => ({}))) as Record<string, unknown>;

      if (!res.ok) {
        const message =
          typeof payload.error === "string" ? payload.error : "We could not sign you in.";
        setError(message);
        throw new ApiError(message, res.status, payload);
      }

      await refresh();
    },
    [refresh]
  );

  const signOutNow = useCallback(async () => {
    await fetch("/api/admin/auth/logout", { method: "POST" }).catch(() => undefined);
    setUser(null);
  }, []);

  const api = useCallback(
    async <T,>(path: string, init: RequestInit = {}): Promise<T> => {
      const headers = new Headers(init.headers);
      if (init.body && !headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
      }

      // The session travels as a cookie; "same-origin" is the default but is
      // stated here so it cannot be lost to a future default change.
      const res = await fetch(path, {
        ...init,
        headers,
        cache: "no-store",
        credentials: "same-origin",
      });
      const payload = (await res.json().catch(() => ({}))) as Record<string, unknown>;

      if (!res.ok) {
        if (res.status === 401) setUser(null);
        throw new ApiError(
          typeof payload.error === "string" ? payload.error : `Request failed (${res.status}).`,
          res.status,
          payload
        );
      }
      return payload as T;
    },
    []
  );

  const value = useMemo(
    () => ({
      user,
      loading,
      error,
      weakPassword,
      sessionSecretSet,
      refresh,
      signIn,
      signOutNow,
      api,
    }),
    [user, loading, error, weakPassword, sessionSecretSet, refresh, signIn, signOutNow, api]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

/* --- Sign-in screen -------------------------------------------------------- */

export function SignIn() {
  const { signIn, error } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  return (
    <div className="adm">
      <div className="adm__signin">
        <div className="adm__signin__box">
          <div className="adm__signin__brand">
            <AdaptisLockup height={30} markFill="#33332C" wordmarkFill="#33332C" title="Adaptis" />
          </div>

          <h1>Sign in to edit the site.</h1>
          <p className="adm__sub" style={{ marginBottom: 24 }}>
            Editor accounts are managed inside the panel.
          </p>

          {error ? <div className="adm__notice adm__notice--error">{error}</div> : null}

          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setBusy(true);
              try {
                await signIn(email, password);
              } catch {
                /* surfaced through context */
              } finally {
                setBusy(false);
              }
            }}
          >
            <div className="adm__field">
              <label className="adm__label" htmlFor="adm-email">
                Email
              </label>
              <input
                id="adm-email"
                className="adm__input"
                type="email"
                autoComplete="username"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="adm__field">
              <label className="adm__label" htmlFor="adm-pw">
                Password
              </label>
              <input
                id="adm-pw"
                className="adm__input"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="adm__btn adm__btn--primary"
              disabled={busy}
              style={{ width: "100%" }}
            >
              {busy ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
