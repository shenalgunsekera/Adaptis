import "server-only";

import { NextResponse } from "next/server";

import { credentialHelp, isConfigured, verifyAdmin, type AdminUser } from "@/lib/firebase/admin";

/* ============================================================================
   Every admin API route begins here.

   The session is a Firebase ID token sent as a bearer credential and verified
   on the server against the allowlist. Nothing is trusted from the client: not
   the email, not a role claim, not a cookie the browser set for itself.
   ========================================================================= */

export interface Authed {
  user: AdminUser;
}

export async function requireAdmin(
  request: Request
): Promise<{ ok: true; user: AdminUser } | { ok: false; response: NextResponse }> {
  const header = request.headers.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";

  if (!token) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Not signed in." }, { status: 401 }),
    };
  }

  // Checked before the token is verified, because without a credential the
  // server cannot verify any token and would otherwise blame the account for
  // its own missing configuration — which sends the reader off hunting
  // through Firebase Auth and the allowlist for a fault that is not there.
  if (!isConfigured) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: `The server has no Google credential, so it cannot verify your sign-in. ${credentialHelp()}` },
        { status: 503 }
      ),
    };
  }

  const user = await verifyAdmin(token);
  if (!user) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "This account is not permitted to edit the site." },
        { status: 403 }
      ),
    };
  }

  return { ok: true, user };
}
