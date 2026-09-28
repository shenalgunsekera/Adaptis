import { NextResponse } from "next/server";

import { SESSION_COOKIE, cookieOptions } from "@/lib/auth/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  // Same attributes as the sign-in cookie, with a zero lifetime: a cookie
  // cleared with different attributes is a second cookie, not a deletion.
  response.cookies.set(SESSION_COOKIE, "", cookieOptions(0));
  return response;
}
