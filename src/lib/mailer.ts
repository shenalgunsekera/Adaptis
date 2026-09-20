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
  to: string;
  submissionId: string;
}

export async function sendEnquiryNotification(enquiry: EnquiryMail): Promise<void> {
  const rows: [string, string][] = [
    ["Name", enquiry.name],
    ["Organization", enquiry.organization || "—"],
    ["Email", enquiry.email],
    ["Working on", enquiry.subject || "—"],
  ];

  const text = [
    `New enquiry from the Adaptis website.`,
    ``,
    ...rows.map(([k, v]) => `${k}: ${v}`),
    ``,
    `Message:`,
    enquiry.message,
    ``,
    `Reference: ${enquiry.submissionId}`,
  ].join("\n");

  const html = `
    <div style="font-family:system-ui,-apple-system,'Segoe UI',sans-serif;color:#33332C;line-height:1.6">
      <p style="margin:0 0 20px"><strong>New enquiry from the Adaptis website.</strong></p>
      <table cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin-bottom:20px">
        ${rows
          .map(
            ([k, v]) =>
              `<tr>
                 <td style="padding:6px 20px 6px 0;color:#6B6967;font-size:13px;vertical-align:top">${esc(k)}</td>
                 <td style="padding:6px 0;font-size:14px">${esc(v)}</td>
               </tr>`
          )
          .join("")}
      </table>
      <div style="border-left:3px solid #FAD758;padding-left:16px;white-space:pre-wrap;font-size:14px">${esc(
        enquiry.message
      )}</div>
      <p style="margin:24px 0 0;color:#6B6967;font-size:12px">Reference: ${esc(enquiry.submissionId)}</p>
    </div>`;

  await transporter().sendMail({
    from: `"Adaptis website" <${user}>`,
    to: enquiry.to,
    // A reply goes to the enquirer, not back to the sending mailbox.
    replyTo: `"${enquiry.name}" <${enquiry.email}>`,
    subject: `Website enquiry — ${enquiry.name}${enquiry.organization ? `, ${enquiry.organization}` : ""}`,
    text,
    html,
  });
}
