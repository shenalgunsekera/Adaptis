import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/apiAuth";
import { credentialHelp, isConfigured } from "@/lib/firebase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* ============================================================================
   Image upload.

   Uploads used to go straight from the browser to Firebase Storage, which the
   storage rules allowed because the browser held a Firebase Auth session.
   Editor accounts are this application's own now, so the browser has no
   Firebase identity and the rules are right to refuse it.

   The file therefore comes here first and is written with the Admin SDK,
   which is the better arrangement anyway: the rules can go back to refusing
   the browser outright, and the only thing that can write to the bucket is a
   request this application has already authorised.
   ========================================================================= */

const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/svg+xml"];
const MAX_BYTES = 8 * 1024 * 1024;

export async function POST(request: Request) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  if (!isConfigured) {
    return NextResponse.json(
      {
        error:
          `Uploads need a Google credential, because the file is written to Firebase Storage. ` +
          `Paste an image address instead, or connect one. ${credentialHelp()}`,
      },
      { status: 503 }
    );
  }

  let file: File | null = null;
  try {
    const form = await request.formData();
    const candidate = form.get("file");
    if (candidate instanceof File) file = candidate;
  } catch {
    return NextResponse.json({ error: "We could not read that upload." }, { status: 400 });
  }

  if (!file) return NextResponse.json({ error: "No file was sent." }, { status: 400 });

  if (!ALLOWED.includes(file.type)) {
    return NextResponse.json(
      { error: "That file type is not supported. Use JPEG, PNG, WebP, AVIF or SVG." },
      { status: 400 }
    );
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: `That file is ${(file.size / 1024 / 1024).toFixed(1)}MB. The limit is 8MB.` },
      { status: 400 }
    );
  }

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-").slice(-80);
  const path = `site/${Date.now()}-${safeName}`;

  try {
    const { getStorage } = await import("firebase-admin/storage");
    const { getApp } = await import("firebase-admin/app");

    // Touch the app through the same accessor the rest of the server uses, so
    // the credential chain is resolved once and in one place.
    const { db } = await import("@/lib/firebase/admin");
    db();

    const bucket = getStorage(getApp("adaptis-admin")).bucket();
    const object = bucket.file(path);

    await object.save(Buffer.from(await file.arrayBuffer()), {
      contentType: file.type,
      metadata: { cacheControl: "public, max-age=31536000, immutable" },
      resumable: false,
    });
    await object.makePublic();

    return NextResponse.json({
      url: `https://storage.googleapis.com/${bucket.name}/${encodeURI(path)}`,
      path,
    });
  } catch (error) {
    console.error("[upload] failed:", error);
    return NextResponse.json(
      { error: "The upload failed. Check that the storage bucket exists and is writable." },
      { status: 500 }
    );
  }
}
