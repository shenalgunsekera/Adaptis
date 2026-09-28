import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/apiAuth";
import { createAdmin, listAdmins } from "@/lib/auth/admins";
import { passwordProblem } from "@/lib/auth/password";
import { hasSessionSecret } from "@/lib/auth/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* ============================================================================
   Editors.

   Any signed-in editor may add another. There is no second tier of "owner":
   the people with access to this panel can already rewrite every page on the
   site, so a privilege boundary between them would be decoration.
   ========================================================================= */

export async function GET() {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  try {
    return NextResponse.json({
      editors: await listAdmins(),
      sessionSecretSet: hasSessionSecret,
      you: auth.user.uid,
    });
  } catch (error) {
    console.error("[editors] list failed:", error);
    return NextResponse.json({ error: "Could not read the editor list." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  let body: { email?: unknown; password?: unknown; name?: unknown };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "We could not read that." }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email : "";
  const password = typeof body.password === "string" ? body.password : "";
  const name = typeof body.name === "string" ? body.name : undefined;

  const problem = passwordProblem(password);
  if (problem) return NextResponse.json({ error: problem }, { status: 400 });

  try {
    const result = await createAdmin({ email, password, name, createdBy: auth.user.email });
    if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });
    return NextResponse.json({ editor: result.admin });
  } catch (error) {
    console.error("[editors] create failed:", error);
    return NextResponse.json({ error: "Could not add that editor." }, { status: 500 });
  }
}
