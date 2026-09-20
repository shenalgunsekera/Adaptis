import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

import { requireAdmin } from "@/lib/apiAuth";
import { tryDb } from "@/lib/firebase/admin";
import { slugToDocId, TAG_PAGES, TAG_SETTINGS } from "@/lib/content";
import { pageSeeds, siteSeed } from "@/content";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* ============================================================================
   Loads the shipped copy deck into Firestore.

   Runs on an empty database to set the site up, and can be re-run later to
   restore a page to the copy that was signed off. It refuses to overwrite
   existing content unless asked, because the whole point of the admin panel
   is that edits survive.
   ========================================================================= */

export async function POST(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;

  const database = tryDb();
  if (!database) {
    return NextResponse.json({ error: "Firestore is not configured." }, { status: 503 });
  }

  const url = new URL(request.url);
  const overwrite = url.searchParams.get("overwrite") === "1";
  const only = url.searchParams.get("slug");

  const written: string[] = [];
  const skipped: string[] = [];

  try {
    const settingsRef = database.collection("settings").doc("site");
    const settingsSnap = await settingsRef.get();
    if (!settingsSnap.exists || overwrite) {
      await settingsRef.set(JSON.parse(JSON.stringify(siteSeed)));
      written.push("settings");
    } else {
      skipped.push("settings");
    }

    for (const page of pageSeeds) {
      if (only !== null && page.slug !== only) continue;

      const ref = database.collection("pages").doc(slugToDocId(page.slug));
      const snap = await ref.get();

      if (snap.exists && !overwrite) {
        skipped.push(page.slug || "home");
        continue;
      }

      await ref.set(
        JSON.parse(
          JSON.stringify({
            ...page,
            updatedAt: new Date().toISOString(),
            updatedBy: `${auth.user.email} (seed)`,
          })
        )
      );
      written.push(page.slug || "home");
    }
  } catch (error) {
    console.error("[admin] seed failed:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Seed failed." },
      { status: 500 }
    );
  }

  revalidateTag(TAG_PAGES);
  revalidateTag(TAG_SETTINGS);

  return NextResponse.json({ ok: true, written, skipped });
}
