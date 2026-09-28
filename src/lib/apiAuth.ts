import "server-only";

import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { findById } from "@/lib/auth/admins";
import { SESSION_COOKIE, readSession } from "@/lib/auth/session";

/* ============================================================================
   Every admin API route begins here.

   The session is a signed, HttpOnly cookie this application issued, checked
   against the account store on every request. Nothing is trusted from the
   client: not the email, not a role, not the cookie's own contents beyond
   what the signature covers.

   Editor accounts are this application's own, so nothing here depends on a
   Google credential. Content still does — Firestore is where pages live —
   but signing in and managing editors keeps working without one.
   ========================================================================= */

export interface AdminUser {
  uid: string;
  email: string;
  name?: string;
}

export interface Authed {
  user: AdminUser;
}

export async function requireAdmin(
  _request?: Request
): Promise<{ ok: true; user: AdminUser } | { ok: false; response: NextResponse }> {
  const jar = await cookies();
  const session = readSession(jar.get(SESSION_COOKIE)?.value);

  if (!session) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Not signed in." }, { status: 401 }),
    };
  }

  // Re-read the account rather than trusting the cookie's copy, so removing
  // an editor takes effect at once instead of at the end of their session.
  let account;
  try {
    account = await findById(session.sub);
  } catch (error) {
    console.error("[auth] could not read editor accounts:", error);
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Editor accounts could not be read. See the server log." },
        { status: 500 }
      ),
    };
  }

  if (!account) {
    return {
      ok: false,
      response: NextResponse.json({ error: "This account no longer exists." }, { status: 403 }),
    };
  }

  return {
    ok: true,
    user: { uid: account.id, email: account.email, name: account.name },
  };
}
