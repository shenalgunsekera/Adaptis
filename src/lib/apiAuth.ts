import "server-only";

import { NextResponse } from "next/server";

import { verifyAdmin, type AdminUser } from "@/lib/firebase/admin";

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
