import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/apiAuth";
import { listAdmins } from "@/lib/auth/admins";
import { claimSubmission, getSettings, releaseSubmission } from "@/lib/content";
import { mailConfigured, sendClaimNotification } from "@/lib/mailer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* ============================================================================
   Claiming an enquiry.

   An enquiry reaches every editor at once, so two of them can start answering
   the same person minutes apart without either knowing. Claiming says "I have
   this" to the others.

   It is a statement, not a lock. Nobody is prevented from opening or reading
   anything; the only thing enforced is that two people cannot both believe
   they claimed it first, which the transaction in claimSubmission settles.
   ========================================================================= */

export async function POST(request: Request) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const body = (await request.json().catch(() => null)) as
    | { id?: string; release?: boolean }
    | null;

  if (!body?.id) return NextResponse.json({ error: "Which enquiry?" }, { status: 400 });

  try {
    if (body.release) {
      const result = await releaseSubmission(body.id, auth.user.uid);
      if (!result.ok) {
        return NextResponse.json(
          {
            error: result.heldBy
              ? `${result.heldBy.name || result.heldBy.email} has this one. Only they can hand it back.`
              : "No such enquiry.",
          },
          { status: 409 }
        );
      }
      return NextResponse.json({ ok: true, released: true });
    }

    const result = await claimSubmission(body.id, auth.user);

    if (!result.ok) {
      if (!result.heldBy) return NextResponse.json({ error: "No such enquiry." }, { status: 404 });
      const who = result.heldBy.name || result.heldBy.email;
      return NextResponse.json(
        {
          error: `${who} claimed this one first. Talk to them rather than both replying.`,
          heldBy: result.heldBy,
        },
        { status: 409 }
      );
    }

    /* The others are told in the enquiry's own email thread, because that is
       where the question "is anyone on this?" was asked. A mail failure must
       not undo the claim: the claim is already recorded and is what the inbox
       reads from. */
    if (mailConfigured && result.submission) {
      try {
        const settings = await getSettings();
        const editors = await listAdmins()
          .then((list) => list.map((e) => e.email))
          .catch(() => [] as string[]);

        // Everyone but the person who just claimed it: they know.
        const others = editors.filter(
          (e) => e.toLowerCase() !== auth.user.email.toLowerCase()
        );

        if (others.length > 0) {
          await sendClaimNotification({
            submissionId: body.id,
            enquirerName: result.submission.name,
            enquirerOrganization: result.submission.organization,
            claimedByEmail: auth.user.email,
            claimedByName: auth.user.name,
            claimedAt: result.submission.claimedAt ?? new Date().toISOString(),
            to: others,
            inboxUrl: settings.seo?.siteUrl
              ? new URL("/admin/inbox", settings.seo.siteUrl).toString()
              : undefined,
          });
        }
      } catch (error) {
        console.error("[claim] could not tell the other editors:", error);
      }
    }

    return NextResponse.json({ ok: true, claimedAt: result.submission?.claimedAt });
  } catch (error) {
    console.error("[claim] failed:", error);
    return NextResponse.json({ error: "Could not claim that enquiry." }, { status: 500 });
  }
}
