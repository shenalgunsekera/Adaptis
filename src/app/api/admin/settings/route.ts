import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/apiAuth";
import { getSettings, saveSettings } from "@/lib/content";
import type { SiteSettings } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;

  return NextResponse.json({ settings: await getSettings() });
}

export async function PUT(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;

  let settings: SiteSettings;
  try {
    settings = (await request.json()) as SiteSettings;
  } catch {
    return NextResponse.json({ error: "We could not read those settings." }, { status: 400 });
  }

  if (!Array.isArray(settings?.nav) || !settings?.footer) {
    return NextResponse.json({ error: "Those are not valid settings." }, { status: 400 });
  }

  // The call to action reads the same in every position, by decision. Guard
  // against it being emptied, which would leave nineteen unlabelled buttons.
  if (!settings.ctaLabel?.trim()) {
    return NextResponse.json(
      { error: "The call to action needs a label. It appears in nineteen places." },
      { status: 400 }
    );
  }

  try {
    await saveSettings(settings);
  } catch (error) {
    console.error("[admin] settings save failed:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not save." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
