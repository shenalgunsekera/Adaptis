/* ============================================================================
   Which Google credential is this environment using, and does it work?

   Run it with `npm run firebase:check`. It reports the route it resolved,
   then actually reaches Firestore and Auth with it, because "configured" and
   "working" are different claims and only the second one matters.

   Prints no secret: a key is reported as present or absent, never echoed.
   ========================================================================= */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

/* .env is read here rather than through dotenv: this is the only script that
   needs it, and a diagnostic should not add a dependency to the project it
   is diagnosing. Next.js loads these files itself at runtime. */
function loadEnv(file) {
  if (!existsSync(file)) return;
  for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
    const m = /^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/.exec(line);
    if (!m) continue;
    const [, key, rawValue] = m;
    if (process.env[key] !== undefined) continue; // real environment wins
    let value = rawValue.trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    process.env[key] = value;
  }
}

loadEnv(".env.local");
loadEnv(".env");

const ok = (s) => `  ok    ${s}`;
const no = (s) => `  --    ${s}`;

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL ?? "";
const rawKey = process.env.FIREBASE_PRIVATE_KEY ?? "";

const hasKey = rawKey.includes("BEGIN PRIVATE KEY") && !rawKey.includes("MIIEv...");
const hasEmail = Boolean(clientEmail) && !clientEmail.includes("xxxxx");

const wifAudience = process.env.GCP_WORKLOAD_IDENTITY_AUDIENCE;
const wifAccount = process.env.GCP_SERVICE_ACCOUNT_EMAIL;
const subject = process.env.VERCEL_OIDC_TOKEN || process.env.GCP_SUBJECT_TOKEN;

const gcloudFile =
  process.platform === "win32"
    ? process.env.APPDATA &&
      join(process.env.APPDATA, "gcloud", "application_default_credentials.json")
    : process.env.HOME &&
      join(process.env.HOME, ".config", "gcloud", "application_default_credentials.json");
const hasGcloud = Boolean(gcloudFile && existsSync(gcloudFile));
const hasAdcEnv = Boolean(process.env.GOOGLE_APPLICATION_CREDENTIALS);

console.log("\nProject");
console.log(
  projectId ? ok(`FIREBASE_PROJECT_ID = ${projectId}`) : no("FIREBASE_PROJECT_ID is not set")
);

console.log("\n1. Service account key");
console.log(
  hasEmail ? ok("FIREBASE_CLIENT_EMAIL set") : no("FIREBASE_CLIENT_EMAIL missing or placeholder")
);
console.log(
  hasKey ? ok("FIREBASE_PRIVATE_KEY set") : no("FIREBASE_PRIVATE_KEY missing or placeholder")
);

console.log("\n2. Workload identity federation (no key)");
console.log(
  wifAudience ? ok("GCP_WORKLOAD_IDENTITY_AUDIENCE set") : no("GCP_WORKLOAD_IDENTITY_AUDIENCE unset")
);
console.log(
  wifAccount ? ok(`GCP_SERVICE_ACCOUNT_EMAIL = ${wifAccount}`) : no("GCP_SERVICE_ACCOUNT_EMAIL unset")
);
console.log(subject ? ok("an OIDC token is present") : no("no OIDC token (only Vercel injects one)"));

console.log("\n3. Application default credentials (no key)");
console.log(
  hasAdcEnv ? ok("GOOGLE_APPLICATION_CREDENTIALS set") : no("GOOGLE_APPLICATION_CREDENTIALS unset")
);
console.log(hasGcloud ? ok(`gcloud login found at ${gcloudFile}`) : no("no gcloud login found"));

let mode = "none";
if (projectId) {
  if (hasEmail && hasKey) mode = "key";
  else if (wifAudience && wifAccount) mode = "workload-identity";
  else if (hasAdcEnv || hasGcloud) mode = "application-default";
}

console.log(`\nResolved route: ${mode}`);

if (mode === "none") {
  console.log(
    "\nNothing to authenticate with, so the site serves its seed copy and the admin\n" +
      "panel cannot save. Pick one of the three above.\n\n" +
      "If your organization blocks service account keys, route 1 is closed to you.\n" +
      "Route 3 is the quickest way to work locally:\n\n" +
      "    gcloud auth application-default login\n" +
      `    gcloud auth application-default set-quota-project ${projectId ?? "<project-id>"}\n\n` +
      "Route 2 is the one for production on Vercel. See docs/SETUP.md section 2.\n"
  );
  process.exit(1);
}

if (mode === "workload-identity" && !subject) {
  console.log(
    "\nWorkload identity is configured, but there is no OIDC token to exchange here.\n" +
      "That is expected on a local machine: Vercel injects VERCEL_OIDC_TOKEN into the\n" +
      "deployment, so this route can only be exercised from a deployed environment.\n"
  );
  process.exit(0);
}

console.log("\nReaching Firestore and Auth with it...\n");

const { cert, applicationDefault, initializeApp } = await import("firebase-admin/app");
const { getFirestore } = await import("firebase-admin/firestore");
const { getAuth } = await import("firebase-admin/auth");

const credential =
  mode === "key"
    ? cert({
        projectId,
        clientEmail,
        privateKey: rawKey.replace(/^["']|["']$/g, "").replace(/\\n/g, "\n"),
      })
    : applicationDefault();

const app = initializeApp({ credential, projectId }, "check");

try {
  const snap = await getFirestore(app).collection("settings").doc("site").get();
  console.log(ok(`Firestore reachable (settings/site ${snap.exists ? "exists" : "not written yet"})`));
} catch (error) {
  console.log(no(`Firestore failed: ${String(error).slice(0, 240)}`));
  process.exitCode = 1;
}

try {
  await getAuth(app).listUsers(1);
  console.log(ok("Auth reachable, so sign-in and token checks will work"));
} catch (error) {
  console.log(no(`Auth failed: ${String(error).slice(0, 240)}`));
  process.exitCode = 1;
}

console.log("");
