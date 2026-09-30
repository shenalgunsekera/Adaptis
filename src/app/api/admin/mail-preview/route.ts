import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/apiAuth";
import { listAdmins } from "@/lib/auth/admins";
import { getSettings } from "@/lib/content";
import { mailConfigured, renderEnquiry } from "@/lib/mailer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* ============================================================================
   What an enquiry notification looks like.

   Renders the real message with sample content and returns it, so the email
   can be reviewed without waiting for someone to fill in the contact form and
   without sending anything. Signed in only: it names every editor address.

   ?format=text returns the plain-text part, which is what a fair number of
   people actually read and the part that silently rots when only the HTML is
   ever looked at.
   ========================================================================= */

const SAMPLE = {
  name: "Dana Whitfield",
  organization: "Forum Asset Management",
  email: "d.whitfield@example.com",
  subject: "Capital planning",
  message:
    "We are refinancing a portfolio of eleven office assets in the GTA next spring, and the condition data we hold is inconsistent between them. Some were assessed in 2019, two have never had a formal assessment, and the carbon figures came from a different consultant again.\n\nWhat we need before the lender conversation is one position per asset that reconciles condition, carbon, cost and compliance, and an honest statement of how accurate each figure is. The timeline is tight: we would want to start within four to six weeks.\n\nHappy to share what we already hold under NDA.",
};

export async function GET(request: Request) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const settings = await getSettings();
  const editors = await listAdmins()
    .then((list) => list.map((e) => e.email))
    .catch(() => [] as string[]);

  const rendered = renderEnquiry({
    ...SAMPLE,
    to: [...editors, settings.contact.notifyEmail].filter(Boolean),
    submissionId: "preview-not-a-real-enquiry",
    receivedAt: new Date().toISOString(),
    inboxUrl: settings.seo?.siteUrl
      ? new URL("/admin/inbox", settings.seo.siteUrl).toString()
      : undefined,
  });

  const format = new URL(request.url).searchParams.get("format");

  if (format === "json") {
    return NextResponse.json({
      subject: rendered.subject,
      recipients: rendered.recipients,
      mailConfigured,
    });
  }

  const body = format === "text" ? rendered.text : rendered.html;
  return new NextResponse(body, {
    headers: {
      "Content-Type": format === "text" ? "text/plain; charset=utf-8" : "text/html; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
