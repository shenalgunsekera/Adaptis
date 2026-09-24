import { NextResponse } from "next/server";

import { tryDb } from "@/lib/firebase/admin";
import { pageSeedBySlug } from "@/content";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* ============================================================================
   Page views.

   Counts only. No cookie is set, no identifier is stored, nothing about the
   reader is written down — one integer per page per day, incremented
   atomically. That is enough to see which pages are read and how many
   readers go on to make contact, and it needs no consent banner because
   there is nothing to consent to.

   The path is validated against the pages this site actually serves, so the
   collection cannot be filled with arbitrary keys by anyone posting here.
   ========================================================================= */

/** Firestore keys cannot contain "/", and the home page has an empty slug. */
function keyFor(slug: string): string | null {
  const clean = slug.replace(/^\/+|\/+$/g, "");
  if (!(clean in pageSeedBySlug)) return null;
  return clean === "" ? "home" : clean.replace(/\//g, "__");
}

export async function POST(request: Request) {
  let body: { path?: unknown };
  try {
    body = (await request.json()) as { path?: unknown };
  } catch {
    return NextResponse.json({ ok: false }, { status: 204 });
  }

  const key = typeof body.path === "string" ? keyFor(body.path) : null;
  // An unknown path is ignored rather than rejected: a 404 is not an error
  // worth reporting to a page that is only counting.
  if (!key) return new NextResponse(null, { status: 204 });

  const database = tryDb();
  if (!database) return new NextResponse(null, { status: 204 });

  const day = new Date().toISOString().slice(0, 10);

  try {
    const { FieldValue } = await import("firebase-admin/firestore");
    await database
      .collection("analytics")
      .doc(day)
      .set(
        {
          views: FieldValue.increment(1),
          paths: { [key]: FieldValue.increment(1) },
        },
        { merge: true }
      );
  } catch (error) {
    // Counting must never affect the page that is being counted.
    console.error("[track] view not recorded:", error);
  }

  return new NextResponse(null, { status: 204 });
}
