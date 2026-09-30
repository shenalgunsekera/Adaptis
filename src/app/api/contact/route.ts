import { NextResponse } from "next/server";

import { tryDb } from "@/lib/firebase/admin";
import { getSettings } from "@/lib/content";
import { mailConfigured, sendEnquiryNotification } from "@/lib/mailer";
import { listAdmins } from "@/lib/auth/admins";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* ============================================================================
   Contact submissions.

   Order of operations matters: the enquiry is written to Firestore first and
   the notification is sent second. If mail fails the enquiry is already safe,
   and the error is recorded against it so the inbox can show what happened.
   ========================================================================= */

const MAX = { name: 200, organization: 200, email: 320, subject: 200, message: 5000 };

/** Best-effort, per-instance rate limit. Serverless instances are not shared,
    so this blunts a naive flood rather than defeating a determined one. */
const recent = new Map<string, number[]>();
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 5;

function rateLimited(key: string): boolean {
  const now = Date.now();
  const hits = (recent.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  hits.push(now);
  recent.set(key, hits);
  if (recent.size > 5000) recent.clear();
  return hits.length > MAX_PER_WINDOW;
}

function str(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export async function POST(request: Request) {
  let payload: Record<string, unknown>;
  try {
    payload = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "We could not read that submission." }, { status: 400 });
  }

  // Honeypot: accepted silently so a bot learns nothing from the response.
  if (str(payload.company_website, 100)) {
    return NextResponse.json({ ok: true });
  }

  const name = str(payload.name, MAX.name);
  const organization = str(payload.organization, MAX.organization);
  const email = str(payload.email, MAX.email);
  const subject = str(payload.subject, MAX.subject);
  const message = str(payload.message, MAX.message);

  if (!name || !email || !message) {
    return NextResponse.json(
      { error: "Please give us a name, an address to reply to, and a note." },
      { status: 400 }
    );
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "That address does not look complete." }, { status: 400 });
  }

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";

  if (rateLimited(ip)) {
    return NextResponse.json(
      { error: "That is a few messages in quick succession. Please try again shortly." },
      { status: 429 }
    );
  }

  const database = tryDb();
  if (!database) {
    return NextResponse.json(
      { error: "The contact form is not connected yet. Please write to us directly." },
      { status: 503 }
    );
  }

  const record = {
    name,
    organization,
    email,
    subject,
    message,
    createdAt: new Date().toISOString(),
    read: false,
    archived: false,
    userAgent: request.headers.get("user-agent")?.slice(0, 300) ?? "",
  };

  let id: string;
  try {
    const ref = await database.collection("contactSubmissions").add(record);
    id = ref.id;
  } catch (error) {
    console.error("[contact] Firestore write failed:", error);
    return NextResponse.json(
      { error: "We could not record that just now. Please try again, or write to us directly." },
      { status: 500 }
    );
  }

  if (mailConfigured) {
    try {
      const settings = await getSettings();

      /* Everyone who can sign in to the panel is told, because the people who
         answer enquiries are the people with access. The configured notify
         address is added on top for a shared mailbox that is not an editor
         account; duplicates are collapsed in the mailer. A failure to read
         the editor list must not cost us the notification, so it degrades to
         the configured address alone. */
      const editors = await listAdmins()
        .then((list) => list.map((e) => e.email))
        .catch((error) => {
          console.error("[contact] could not read the editor list:", error);
          return [] as string[];
        });

      const configured = process.env.CONTACT_NOTIFY_EMAIL ?? settings.contact.notifyEmail;

      await sendEnquiryNotification({
        name,
        organization,
        email,
        subject,
        message,
        to: [...editors, configured].filter(Boolean),
        submissionId: id,
        receivedAt: record.createdAt,
        inboxUrl: settings.seo?.siteUrl
          ? new URL("/admin/inbox", settings.seo.siteUrl).toString()
          : undefined,
      });
    } catch (error) {
      // The enquiry is saved; record why the notification did not arrive.
      console.error("[contact] notification email failed:", error);
      await database
        .collection("contactSubmissions")
        .doc(id)
        .update({ mailError: error instanceof Error ? error.message : String(error) })
        .catch(() => undefined);
    }
  }

  // Recorded alongside the day's views so the conversion rate needs no join.
  try {
    const { FieldValue } = await import("firebase-admin/firestore");
    await database
      .collection("analytics")
      .doc(new Date().toISOString().slice(0, 10))
      .set({ enquiries: FieldValue.increment(1) }, { merge: true });
  } catch {
    /* the enquiry is already saved; the counter is not worth failing over */
  }

  return NextResponse.json({ ok: true, id });
}
