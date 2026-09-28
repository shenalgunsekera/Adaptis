import "server-only";

import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

/* ============================================================================
   Admin sessions.

   A signed cookie rather than a row in a table: there is no session store to
   keep, and a stolen cookie cannot be replayed past its expiry. The payload
   carries only what authorisation needs — who, and until when.

   The cookie is HttpOnly so script cannot read it, SameSite=Lax so it is not
   sent on cross-site POSTs, and Secure everywhere but local http.

   Signed with ADMIN_SESSION_SECRET. Without one set, a per-boot random secret
   is used, which is safe but signs people out on every restart and on every
   new serverless instance — so production must set it, and startup says so.
   ========================================================================= */

export const SESSION_COOKIE = "adaptis_admin";

/** Eight hours: a working day, after which an unattended browser is no longer
    a way in. */
export const SESSION_MAX_AGE_S = 8 * 60 * 60;

const FALLBACK_SECRET = randomBytes(32).toString("hex");

export const hasSessionSecret = Boolean(
  process.env.ADMIN_SESSION_SECRET && process.env.ADMIN_SESSION_SECRET.length >= 16
);

function secret(): string {
  return hasSessionSecret ? process.env.ADMIN_SESSION_SECRET! : FALLBACK_SECRET;
}

export interface SessionPayload {
  /** The admin's id in the store. */
  sub: string;
  email: string;
  name?: string;
  /** Seconds since the epoch. */
  exp: number;
}

function b64url(input: Buffer | string): string {
  return Buffer.from(input)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function unb64url(input: string): Buffer {
  return Buffer.from(input.replace(/-/g, "+").replace(/_/g, "/"), "base64");
}

function sign(body: string): string {
  return b64url(createHmac("sha256", secret()).update(body).digest());
}

export function createSession(payload: Omit<SessionPayload, "exp">): string {
  const full: SessionPayload = {
    ...payload,
    exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE_S,
  };
  const body = b64url(JSON.stringify(full));
  return `${body}.${sign(body)}`;
}

/** Null for anything that is not a currently valid, correctly signed token. */
export function readSession(token: string | undefined | null): SessionPayload | null {
  if (!token) return null;

  const dot = token.lastIndexOf(".");
  if (dot <= 0) return null;

  const body = token.slice(0, dot);
  const signature = token.slice(dot + 1);

  const expected = sign(body);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  try {
    const payload = JSON.parse(unb64url(body).toString("utf8")) as SessionPayload;
    if (!payload?.sub || !payload?.email || typeof payload.exp !== "number") return null;
    if (payload.exp * 1000 <= Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

/** The Set-Cookie attributes, shared by sign-in and sign-out so they cannot
    drift apart — a logout whose attributes differ does not clear the cookie. */
export function cookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  };
}
