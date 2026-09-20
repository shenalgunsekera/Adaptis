import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/apiAuth";
import { getPage, docIdToSlug } from "@/lib/content";
import { checkPage } from "@/lib/brandCheck";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Returns one page in full, for the editor. The id is the slug with "/"
    replaced by "__", matching how the document is stored. */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;

  const { id } = await params;
  const page = await getPage(docIdToSlug(id));

  if (!page) {
    return NextResponse.json({ error: "No such page." }, { status: 404 });
  }

  return NextResponse.json({ page, findings: checkPage(page) });
}
