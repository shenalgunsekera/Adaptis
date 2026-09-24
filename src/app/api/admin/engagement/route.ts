import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/apiAuth";
import { getEngagement } from "@/lib/content";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;

  const days = Number(new URL(request.url).searchParams.get("days") ?? 30);
  const window = Number.isFinite(days) ? Math.min(Math.max(days, 7), 365) : 30;

  try {
    return NextResponse.json({ engagement: await getEngagement(window), days: window });
  } catch (error) {
    console.error("[admin] engagement read failed:", error);
    return NextResponse.json({ error: "Could not read engagement." }, { status: 500 });
  }
}
