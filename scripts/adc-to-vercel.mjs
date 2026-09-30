/* ============================================================================
   Turn a local `gcloud auth application-default login` into a value Vercel
   can use, and say plainly what you are trading away by doing it.

   Run: npm run adc:export

   Prints the one-line JSON to paste into GOOGLE_USER_CREDENTIALS. That value
   is a live credential for the account that signed in — treat it like a
   password: not into chat, not into a commit, not into a screenshot.
   ========================================================================= */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const adcPath =
  process.env.GOOGLE_APPLICATION_CREDENTIALS ??
  (process.platform === "win32"
    ? join(process.env.APPDATA ?? "", "gcloud", "application_default_credentials.json")
    : join(process.env.HOME ?? "", ".config", "gcloud", "application_default_credentials.json"));

if (!existsSync(adcPath)) {
  console.error(
    `\nNo application default credentials at:\n  ${adcPath}\n\n` +
      "Sign in first:\n" +
      "  gcloud auth application-default login\n" +
      "  gcloud auth application-default set-quota-project adaptis-db\n"
  );
  process.exit(1);
}

let parsed;
try {
  parsed = JSON.parse(readFileSync(adcPath, "utf8"));
} catch {
  console.error(`\nCould not read ${adcPath} as JSON.\n`);
  process.exit(1);
}

if (parsed.type !== "authorized_user" || !parsed.refresh_token) {
  console.error(
    `\nThat file is a "${parsed.type ?? "unknown"}" credential, not a user login.\n` +
      "If it is a service account key, use FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY instead.\n"
  );
  process.exit(1);
}

// Only the three fields the credential actually needs. quota_project_id and
// anything else gcloud wrote are left behind rather than shipped.
const minimal = {
  type: "authorized_user",
  client_id: parsed.client_id,
  client_secret: parsed.client_secret,
  refresh_token: parsed.refresh_token,
};

console.log(`
Read from: ${adcPath}
Account:   the Google account you signed in with

Set this in Vercel, Settings, Environment Variables, name GOOGLE_USER_CREDENTIALS:

${JSON.stringify(minimal)}

Alongside it:
  FIREBASE_PROJECT_ID=adaptis-db
  ADMIN_SESSION_SECRET=<32 random bytes, hex>
  ADMIN_BOOTSTRAP_PASSWORD=<not 123456>

Before you do, know what this is:

  It is a person, not a service. That value carries the signed-in account's
  Google access, not a narrowed slice of it. The service account key your
  organization forbids would be the smaller grant of the two.

  It expires without warning. A password change revokes it. So does a
  Workspace session policy, an admin revoking application access, or long
  disuse. The site loses Firestore at a moment nobody chose.

  Google intends these credentials for local development.

Use it to get deployed this week. Replace it with workload identity, or with
a key if your organization grants an exemption, before it becomes permanent.
`);
