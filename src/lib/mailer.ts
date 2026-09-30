import "server-only";

import nodemailer from "nodemailer";

/* ============================================================================
   Notification email, over Gmail SMTP.

   Gmail will not accept an account password for SMTP. SMTP_PASS must be a
   16-character Google app password, generated at myaccount.google.com under
   Security once two-step verification is on. Nothing here is committed: both
   values come from the environment, and the app password can be revoked from
   that same page without touching the code.

   A failure here is never allowed to fail a submission. The Firestore write
   is the record of truth; a mail error is stored alongside it and surfaced in
   the admin inbox.
   ========================================================================= */

const host = process.env.SMTP_HOST ?? "smtp.gmail.com";
const port = Number(process.env.SMTP_PORT ?? 465);
const user = process.env.SMTP_USER;
const pass = process.env.SMTP_PASS;

export const mailConfigured = Boolean(user && pass);

let cached: nodemailer.Transporter | null = null;

function transporter(): nodemailer.Transporter {
  if (!mailConfigured) throw new Error("SMTP is not configured.");
  if (cached) return cached;
  cached = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user: user!, pass: pass! },
  });
  return cached;
}

/** Escapes text before it is placed in the HTML part of the message. */
function esc(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export interface EnquiryMail {
  name: string;
  organization: string;
  email: string;
  subject: string;
  message: string;
  /** Everyone who should see it. Sent as Bcc so no recipient learns the list. */
  to: string[];
  submissionId: string;
  receivedAt?: string;
  /** Absolute address of the admin inbox, when the site address is known. */
  inboxUrl?: string;
}

/* Brand values, inlined because an email has no stylesheet and no webfonts.
   Ink and Naples are the two that carry the identity; everything else is the
   neutral ramp the site already uses. */
const INK = "#33332C";
const NAPLES = "#FAD758";
const SECONDARY = "#6B6967";
const LINE = "#E6E3DE";
const CARD = "#FFFDF9";

/** Composes the message. Kept separate from sending so it can be rendered
    and looked at without a mail server, which is the only honest way to
    review how it actually reads. */
export function renderEnquiry(enquiry: EnquiryMail): {
  subject: string;
  text: string;
  html: string;
  recipients: string[];
} {
  const recipients = [...new Set(enquiry.to.map((t) => t.trim().toLowerCase()).filter(Boolean))];
  if (recipients.length === 0) throw new Error("No recipient address for the enquiry notification.");

  const received = enquiry.receivedAt
    ? new Date(enquiry.receivedAt).toLocaleString("en-CA", {
        dateStyle: "long",
        timeStyle: "short",
        timeZone: "America/Toronto",
      })
    : null;

  const rows: [string, string][] = [
    ["Name", enquiry.name],
    ["Organization", enquiry.organization || "Not given"],
    ["Email", enquiry.email],
    ["Working on", enquiry.subject || "Not specified"],
  ];
  // Not a "Received" row: the header already carries the timestamp, and the
  // plain-text part adds it there instead, where there is no header to carry
  // it.

  /* null is "leave this line out", "" is "a blank line here". Filtering on
     truthiness would collapse the two and run the whole message together. */
  const text = [
    "New enquiry from the Adaptis website.",
    received,
    "",
    ...rows.map(([k, v]) => `${k}: ${v}`),
    "",
    "Message",
    "-------",
    enquiry.message,
    "",
    `Reply directly to this email and it goes to ${enquiry.name} at ${enquiry.email}.`,
    enquiry.inboxUrl ? `Admin inbox: ${enquiry.inboxUrl}` : null,
    `Reference: ${enquiry.submissionId}`,
  ]
    .filter((line): line is string => line !== null)
    .join("\n");

  const html = `<!doctype html>
<html lang="en">
  <body style="margin:0;padding:24px;background:${CARD};">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"
           style="max-width:600px;margin:0 auto;border-collapse:collapse;
                  font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;
                  color:${INK};">
      <tr>
        <td style="background:${INK};padding:24px 28px;">
          <div style="width:28px;height:4px;background:${NAPLES};margin-bottom:14px;"></div>
          <div style="color:#FFFFFF;font-size:17px;font-weight:600;letter-spacing:-0.01em;">
            New enquiry from the website
          </div>
          <div style="color:#D8D6D4;font-size:13px;margin-top:4px;">
            ${received ? esc(received) : "Just now"}
          </div>
        </td>
      </tr>

      <tr>
        <td style="background:#FFFFFF;padding:24px 28px;border-left:1px solid ${LINE};border-right:1px solid ${LINE};">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"
                 style="border-collapse:collapse;">
            ${rows
              .map(
                ([k, v]) => `<tr>
                  <td style="padding:7px 18px 7px 0;color:${SECONDARY};font-size:12px;
                             vertical-align:top;white-space:nowrap;">${esc(k)}</td>
                  <td style="padding:7px 0;font-size:14px;color:${INK};">${
                    k === "Email"
                      ? `<a href="mailto:${esc(v)}" style="color:${INK};">${esc(v)}</a>`
                      : esc(v)
                  }</td>
                </tr>`
              )
              .join("")}
          </table>
        </td>
      </tr>

      <tr>
        <td style="background:#FFFFFF;padding:0 28px 24px;border-left:1px solid ${LINE};border-right:1px solid ${LINE};">
          <div style="color:${SECONDARY};font-size:12px;margin-bottom:8px;">Message</div>
          <div style="border-left:3px solid ${NAPLES};padding:2px 0 2px 16px;
                      white-space:pre-wrap;font-size:14px;line-height:1.65;color:${INK};">${esc(
                        enquiry.message
                      )}</div>
        </td>
      </tr>

      <tr>
        <td style="background:#FFFFFF;padding:0 28px 26px;border-left:1px solid ${LINE};
                   border-right:1px solid ${LINE};border-bottom:1px solid ${LINE};">
          <div style="border-top:1px solid ${LINE};padding-top:16px;font-size:13px;color:${SECONDARY};line-height:1.6;">
            Reply to this email and it goes straight to ${esc(enquiry.name)}.
            ${
              enquiry.inboxUrl
                ? `<br /><a href="${esc(enquiry.inboxUrl)}" style="color:${INK};">Open the admin inbox</a>`
                : ""
            }
          </div>
        </td>
      </tr>

      <tr>
        <td style="padding:14px 28px;color:${SECONDARY};font-size:11px;">
          Reference ${esc(enquiry.submissionId)}
        </td>
      </tr>
    </table>
  </body>
</html>`;

  const org = enquiry.organization ? `, ${enquiry.organization}` : "";

  return {
    subject: `Website enquiry — ${enquiry.name}${org}`,
    text,
    html,
    recipients,
  };
}

/* Derived from the submission id rather than left to the mail server, so a
   later message about the same enquiry can quote it in In-Reply-To and land
   in the same thread. The domain half only has to be stable and plausible;
   it is never resolved. */
function messageIdFor(submissionId: string): string {
  return `<enquiry-${submissionId}@adaptis.ca>`;
}

export async function sendEnquiryNotification(enquiry: EnquiryMail): Promise<void> {
  const { subject, text, html, recipients } = renderEnquiry(enquiry);

  await transporter().sendMail({
    from: `"Adaptis website" <${user}>`,
    // Bcc rather than To: every editor is told without any of them, or the
    // enquirer on a reply-all, learning who else is on the list.
    to: `"Adaptis" <${user}>`,
    bcc: recipients,
    // A reply goes to the enquirer, not back to the sending mailbox.
    replyTo: `"${enquiry.name}" <${enquiry.email}>`,
    messageId: messageIdFor(enquiry.submissionId),
    subject,
    text,
    html,
  });
}

export interface ClaimMail {
  submissionId: string;
  /** The enquirer, so the subject still says who this is about. */
  enquirerName: string;
  enquirerOrganization: string;
  claimedByEmail: string;
  claimedByName?: string;
  claimedAt: string;
  to: string[];
  inboxUrl?: string;
}

/**
 * Tells the other editors that someone has picked an enquiry up.
 *
 * Threaded onto the original notification with In-Reply-To and References, so
 * it appears as a reply under the enquiry rather than as a second, unrelated
 * message — which is the whole point: the answer to "is anyone on this?" has
 * to be in the same place as the question.
 *
 * Reply-To is this mailbox, not the enquirer. A reply here is a word between
 * colleagues, and must not be delivered to the person who made the enquiry.
 */
export async function sendClaimNotification(claim: ClaimMail): Promise<void> {
  const recipients = [...new Set(claim.to.map((t) => t.trim().toLowerCase()).filter(Boolean))];
  if (recipients.length === 0) return;

  const who = claim.claimedByName?.trim() || claim.claimedByEmail;
  const when = new Date(claim.claimedAt).toLocaleString("en-CA", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "America/Toronto",
  });
  const org = claim.enquirerOrganization ? `, ${claim.enquirerOrganization}` : "";

  const text = [
    `${who} is handling this enquiry.`,
    "",
    `Picked up ${when}.`,
    "",
    "No one else needs to reply. If you are already mid-answer, say so now.",
    claim.inboxUrl ? `` : null,
    claim.inboxUrl ? `Admin inbox: ${claim.inboxUrl}` : null,
  ]
    .filter((line): line is string => line !== null)
    .join("\n");

  const html = `<!doctype html>
<html lang="en">
  <body style="margin:0;padding:24px;background:${CARD};">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"
           style="max-width:600px;margin:0 auto;border-collapse:collapse;
                  font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;
                  color:${INK};">
      <tr>
        <td style="background:#FFFFFF;border:1px solid ${LINE};padding:22px 26px;">
          <div style="width:28px;height:4px;background:${NAPLES};margin-bottom:14px;"></div>
          <div style="font-size:16px;font-weight:600;letter-spacing:-0.01em;">
            ${esc(who)} is handling this enquiry
          </div>
          <div style="color:${SECONDARY};font-size:13px;margin-top:6px;">
            Picked up ${esc(when)}
          </div>
          <div style="border-top:1px solid ${LINE};margin-top:18px;padding-top:16px;
                      font-size:14px;line-height:1.6;">
            No one else needs to reply. If you are already mid-answer, say so now.
          </div>
          ${
            claim.inboxUrl
              ? `<div style="margin-top:14px;font-size:13px;">
                   <a href="${esc(claim.inboxUrl)}" style="color:${INK};">Open the admin inbox</a>
                 </div>`
              : ""
          }
        </td>
      </tr>
    </table>
  </body>
</html>`;

  const parent = messageIdFor(claim.submissionId);

  await transporter().sendMail({
    from: `"Adaptis website" <${user}>`,
    to: `"Adaptis" <${user}>`,
    bcc: recipients,
    // Back to this mailbox, never to the enquirer: this is an aside between
    // colleagues that happens to live in the enquiry's thread.
    replyTo: `"Adaptis" <${user}>`,
    inReplyTo: parent,
    references: [parent],
    subject: `Re: Website enquiry — ${claim.enquirerName}${org}`,
    text,
    html,
  });
}
