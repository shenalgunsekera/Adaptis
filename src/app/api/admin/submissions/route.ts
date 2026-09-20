import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/apiAuth";
import { deleteSubmission, listSubmissions, updateSubmission } from "@/lib/content";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;

  try {
    return NextResponse.json({ submissions: await listSubmissions(200) });
  } catch (error) {
    console.error("[admin] submissions read failed:", error);
    return NextResponse.json({ submissions: [], error: "Could not read the inbox." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;

  const body = (await request.json().catch(() => null)) as
    | { id?: string; read?: boolean; archived?: boolean }
    | null;

  if (!body?.id) {
    return NextResponse.json({ error: "Which submission?" }, { status: 400 });
  }

  const patch: { read?: boolean; archived?: boolean } = {};
  if (typeof body.read === "boolean") patch.read = body.read;
  if (typeof body.archived === "boolean") patch.archived = body.archived;

  await updateSubmission(body.id, patch);
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;

  const id = new URL(request.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Which submission?" }, { status: 400 });

  await deleteSubmission(id);
  return NextResponse.json({ ok: true });
}
