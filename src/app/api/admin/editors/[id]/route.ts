import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/apiAuth";
import { deleteAdmin, findById, renameAdmin, setPassword } from "@/lib/auth/admins";
import { passwordProblem } from "@/lib/auth/password";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Change a password or a name. An editor may change anyone's, which is the
    only way to reset a colleague who is locked out; there is no email to send
    a reset link to. */
export async function PATCH(request: Request, ctx: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const { id } = await ctx.params;

  let body: { password?: unknown; name?: unknown };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "We could not read that." }, { status: 400 });
  }

  if (!(await findById(id))) {
    return NextResponse.json({ error: "No such editor." }, { status: 404 });
  }

  if (typeof body.password === "string" && body.password.length > 0) {
    const problem = passwordProblem(body.password);
    if (problem) return NextResponse.json({ error: problem }, { status: 400 });
    await setPassword(id, body.password);
  }

  if (typeof body.name === "string") {
    await renameAdmin(id, body.name);
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: Request, ctx: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const { id } = await ctx.params;

  if (id === auth.user.uid) {
    return NextResponse.json(
      { error: "You cannot remove the account you are signed in with." },
      { status: 400 }
    );
  }

  try {
    const result = await deleteAdmin(id);
    if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[editors] delete failed:", error);
    return NextResponse.json({ error: "Could not remove that editor." }, { status: 500 });
  }
}
