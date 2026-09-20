import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/apiAuth";
import { getAllPages, savePage } from "@/lib/content";
import { checkPage } from "@/lib/brandCheck";
import type { Page } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Lists every page, with its brand-check summary. */
export async function GET(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;

  const pages = await getAllPages();
  return NextResponse.json({
    pages: pages.map((p) => ({
      slug: p.slug,
      name: p.name,
      sections: p.sections.length,
      updatedAt: p.updatedAt ?? null,
      updatedBy: p.updatedBy ?? null,
      findings: checkPage(p),
    })),
  });
}

/** Saves a page. The brand check runs server side too, so a client that
    skipped it cannot save a page that breaks a hard rule unattended. */
export async function PUT(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;

  let page: Page;
  try {
    page = (await request.json()) as Page;
  } catch {
    return NextResponse.json({ error: "We could not read that page." }, { status: 400 });
  }

  if (typeof page?.slug !== "string" || !Array.isArray(page?.sections)) {
    return NextResponse.json({ error: "That is not a valid page." }, { status: 400 });
  }

  const findings = checkPage(page);
  const errors = findings.filter((f) => f.severity === "error");

  const url = new URL(request.url);
  const force = url.searchParams.get("force") === "1";

  if (errors.length > 0 && !force) {
    return NextResponse.json(
      {
        error: "This page breaks a brand rule.",
        findings,
        // The editor may override deliberately; the finding is kept either way.
        overridable: true,
      },
      { status: 409 }
    );
  }

  try {
    await savePage(page, auth.user.email);
  } catch (error) {
    console.error("[admin] page save failed:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not save." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, findings });
}
