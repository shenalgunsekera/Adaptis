import { NextResponse } from "next/server";

import { FirestoreUnavailable, authenticate, recordSignIn } from "@/lib/auth/admins";
import { SESSION_COOKIE, SESSION_MAX_AGE_S, cookieOptions, createSession } from "@/lib/auth/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* ============================================================================
   Sign in.

   One answer for every failure — wrong address, wrong password, no such
   account — so the response cannot be used to work out which addresses exist.
   The store spends comparable time on a miss for the same reason.
   ========================================================================= */

/** Per-instance, best effort. Serverless instances are not shared, so this
    blunts a naive attempt rather than defeating a determined one; the scrypt
    cost is what makes guessing expensive. */
const attempts = new Map<string, number[]>();
const WINDOW_MS = 10 * 60_000;
const MAX_PER_WINDOW = 10;

function rateLimited(key: string): boolean {
  const now = Date.now();
  const hits = (attempts.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  hits.push(now);
  attempts.set(key, hits);
  if (attempts.size > 5000) attempts.clear();
  return hits.length > MAX_PER_WINDOW;
}

export async function POST(request: Request) {
  let body: { email?: unknown; password?: unknown };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "We could not read that." }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email.trim().slice(0, 320) : "";
  const password = typeof body.password === "string" ? body.password.slice(0, 1024) : "";

  if (!email || !password) {
    return NextResponse.json({ error: "Enter an email and a password." }, { status: 400 });
  }

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";

  if (rateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many attempts. Wait a few minutes and try again." },
      { status: 429 }
    );
  }

  let result;
  try {
    result = await authenticate(email, password);
  } catch (error) {
    if (error instanceof FirestoreUnavailable) {
      const { credentialHelp } = await import("@/lib/firebase/admin");
      return NextResponse.json(
        {
          error:
            "Editor accounts live in Firestore, which this server cannot reach, so there is " +
            `nothing to check your password against. ${credentialHelp()}`,
        },
        { status: 503 }
      );
    }
    console.error("[auth] sign-in failed:", error);
    return NextResponse.json(
      { error: "Editor accounts could not be read. See the server log." },
      { status: 500 }
    );
  }

  if (!result) {
    return NextResponse.json(
      { error: "That email and password do not match an account." },
      { status: 401 }
    );
  }

  const { account, usingBootstrapPassword } = result;

  await recordSignIn(account.id).catch(() => undefined);

  const token = createSession({
    sub: account.id,
    email: account.email,
    name: account.name,
  });

  const response = NextResponse.json({
    user: { id: account.id, email: account.email, name: account.name },
    usingBootstrapPassword,
  });
  response.cookies.set(SESSION_COOKIE, token, cookieOptions(SESSION_MAX_AGE_S));
  return response;
}
