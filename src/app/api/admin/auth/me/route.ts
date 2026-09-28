import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { findById } from "@/lib/auth/admins";
import { SESSION_COOKIE, hasSessionSecret, readSession } from "@/lib/auth/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Who the browser currently is, if anyone. The panel asks on load so a
    refresh does not drop the session. */
export async function GET() {
  const jar = await cookies();
  const session = readSession(jar.get(SESSION_COOKIE)?.value);

  if (!session) {
    return NextResponse.json({ user: null, sessionSecretSet: hasSessionSecret });
  }

  // Checked against the store, not taken from the cookie: an account deleted
  // during a session must stop working immediately.
  const account = await findById(session.sub).catch(() => null);
  if (!account) {
    return NextResponse.json({ user: null, sessionSecretSet: hasSessionSecret });
  }

  return NextResponse.json({
    user: { id: account.id, email: account.email, name: account.name },
    weakPassword: account.weakPassword === true,
    sessionSecretSet: hasSessionSecret,
  });
}
