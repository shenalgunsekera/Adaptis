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
import {
  browserLocalPersistence,
  onAuthStateChanged,
  setPersistence,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from "firebase/auth";

import { clientAuth, isClientConfigured } from "@/lib/firebase/client";
import { AdaptisLockup } from "@/components/brand/Lockup";

/* ============================================================================
   Admin session.

   Sign-in is Firebase email and password. The resulting ID token is attached
   to every admin request and verified on the server against the allowlist, so
   the client holds no authority of its own: signing in as a non-allowlisted
   account succeeds at Firebase and is then refused by every API route.

   Tokens are short lived and refreshed by the SDK; api() always asks for a
   current one rather than caching a stale string.
   ========================================================================= */

interface AuthValue {
  user: User | null;
  loading: boolean;
  error: string | null;
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

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isClientConfigured) {
      setLoading(false);
      setError(
        "Firebase is not configured in this environment. Set the NEXT_PUBLIC_FIREBASE_* variables and reload."
      );
      return;
    }

    const auth = clientAuth();
    setPersistence(auth, browserLocalPersistence).catch(() => undefined);

    return onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    setError(null);
    try {
      await signInWithEmailAndPassword(clientAuth(), email, password);
    } catch (e) {
      const code = (e as { code?: string }).code ?? "";
      setError(
        code === "auth/invalid-credential" ||
          code === "auth/wrong-password" ||
          code === "auth/user-not-found"
          ? "That email and password do not match an account."
          : code === "auth/too-many-requests"
            ? "Too many attempts. Wait a moment and try again."
            : "We could not sign you in. Please try again."
      );
      throw e;
    }
  }, []);

  const signOutNow = useCallback(async () => {
    await signOut(clientAuth());
  }, []);

  const api = useCallback(
    async <T,>(path: string, init: RequestInit = {}): Promise<T> => {
      const current = clientAuth().currentUser;
      if (!current) throw new ApiError("Not signed in.", 401, null);

      const token = await current.getIdToken();
      const headers = new Headers(init.headers);
      headers.set("Authorization", `Bearer ${token}`);
      if (init.body && !headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
      }

      const res = await fetch(path, { ...init, headers, cache: "no-store" });
      const payload = (await res.json().catch(() => ({}))) as Record<string, unknown>;

      if (!res.ok) {
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
    () => ({ user, loading, error, signIn, signOutNow, api }),
    [user, loading, error, signIn, signOutNow, api]
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
            Your account must be on the editor allowlist.
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

            <button type="submit" className="adm__btn adm__btn--primary" disabled={busy} style={{ width: "100%" }}>
              {busy ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
