import "server-only";

import { existsSync } from "node:fs";
import { join } from "node:path";

import {
  applicationDefault,
  cert,
  getApp,
  getApps,
  initializeApp,
  type App,
  type Credential,
} from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

/* ============================================================================
   Firebase Admin, server side.

   Deliberately tolerant of missing configuration. The public site must render
   from its seed content when Firestore is unreachable or not yet set up, so
   nothing here throws at import time: callers check `isConfigured` and fall
   back. The admin panel, which cannot fall back, surfaces the error instead.

   There are three ways to authenticate, tried in order. A downloaded service
   account key is only the first of them, and increasingly the one an
   organization will not allow: the `iam.disableServiceAccountKeyCreation`
   policy exists precisely because a downloaded key is a long-lived secret
   that leaks. The other two carry no key at all.

     1. Service account key   FIREBASE_CLIENT_EMAIL + FIREBASE_PRIVATE_KEY
     2. Workload identity     GCP_WORKLOAD_IDENTITY_AUDIENCE + GCP_SERVICE_ACCOUNT_EMAIL
     3. Application default   GOOGLE_APPLICATION_CREDENTIALS, gcloud, or on GCP

   See docs/SETUP.md section 2 for which to use where.
   ========================================================================= */

const APP_NAME = "adaptis-admin";

const projectId = process.env.FIREBASE_PROJECT_ID;

/* --- 1. Service account key ------------------------------------------------ */

function readPrivateKey(): string | undefined {
  const key = process.env.FIREBASE_PRIVATE_KEY;
  if (!key) return undefined;
  // Vercel stores the key with escaped newlines; a .env.local file may hold
  // either form. Normalise both, and strip wrapping quotes if present.
  const normalised = key.replace(/^["']|["']$/g, "").replace(/\\n/g, "\n");
  // The placeholder in .env.example must not read as a configured key.
  return normalised.includes("BEGIN PRIVATE KEY") && !normalised.includes("MIIEv...")
    ? normalised
    : undefined;
}

const clientEmail = process.env.FIREBASE_CLIENT_EMAIL?.includes("xxxxx")
  ? undefined
  : process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = readPrivateKey();

/* --- 2. Workload identity federation ---------------------------------------
   The keyless route, and the one to use on Vercel when key creation is
   blocked. Vercel signs a short-lived OIDC token for each deployment; Google
   trades it for a federated token, which is then used to mint an access token
   for the service account. Nothing long-lived is ever stored, and the service
   account being impersonated is the one Firebase created for the project
   anyway, so nothing new has to be created either.
   -------------------------------------------------------------------------- */

const STS_ENDPOINT = "https://sts.googleapis.com/v1/token";
const IAM_ENDPOINT = "https://iamcredentials.googleapis.com/v1/projects/-/serviceAccounts";
const CLOUD_PLATFORM = "https://www.googleapis.com/auth/cloud-platform";

const wifAudience = process.env.GCP_WORKLOAD_IDENTITY_AUDIENCE;
const wifServiceAccount = process.env.GCP_SERVICE_ACCOUNT_EMAIL;

/** The platform's own signed statement of identity. Vercel injects this; any
    other host can supply one under GCP_SUBJECT_TOKEN. */
function subjectToken(): string | undefined {
  return process.env.VERCEL_OIDC_TOKEN || process.env.GCP_SUBJECT_TOKEN || undefined;
}

async function federatedAccessToken(
  audience: string,
  serviceAccount: string
): Promise<{ access_token: string; expires_in: number }> {
  const subject = subjectToken();
  if (!subject) {
    throw new Error(
      "Workload identity is configured but no OIDC token was found. On Vercel, enable " +
        "Secure Backend Access (OIDC) for the project so VERCEL_OIDC_TOKEN is injected."
    );
  }

  const exchange = await fetch(STS_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      audience,
      grantType: "urn:ietf:params:oauth:grant-type:token-exchange",
      requestedTokenType: "urn:ietf:params:oauth:token-type:access_token",
      scope: CLOUD_PLATFORM,
      subjectTokenType: "urn:ietf:params:oauth:token-type:jwt",
      subjectToken: subject,
    }),
  });

  if (!exchange.ok) {
    throw new Error(
      `Google refused the token exchange (${exchange.status}). Check that the audience matches ` +
        `the workload identity provider exactly. ${(await exchange.text()).slice(0, 300)}`
    );
  }

  const federated = (await exchange.json()) as { access_token?: string };
  if (!federated.access_token) throw new Error("Token exchange returned no access token.");

  const impersonate = await fetch(
    `${IAM_ENDPOINT}/${encodeURIComponent(serviceAccount)}:generateAccessToken`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${federated.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ scope: [CLOUD_PLATFORM] }),
    }
  );

  if (!impersonate.ok) {
    throw new Error(
      `Google refused to mint a token for ${serviceAccount} (${impersonate.status}). The pool's ` +
        `principal needs roles/iam.workloadIdentityUser on that service account. ` +
        `${(await impersonate.text()).slice(0, 300)}`
    );
  }

  const minted = (await impersonate.json()) as { accessToken?: string; expireTime?: string };
  if (!minted.accessToken) throw new Error("Impersonation returned no access token.");

  const secondsLeft = minted.expireTime
    ? Math.floor((Date.parse(minted.expireTime) - Date.now()) / 1000)
    : 3600;

  return { access_token: minted.accessToken, expires_in: Math.max(60, secondsLeft) };
}

function federatedCredential(audience: string, serviceAccount: string): Credential {
  let cached: { token: { access_token: string; expires_in: number }; until: number } | null = null;

  return {
    async getAccessToken() {
      if (cached && Date.now() < cached.until) return cached.token;
      const token = await federatedAccessToken(audience, serviceAccount);
      // Renew a minute early so a request never carries an expiring token.
      cached = { token, until: Date.now() + (token.expires_in - 60) * 1000 };
      return token;
    },
  };
}

/* --- 3. Application default credentials ------------------------------------
   What `gcloud auth application-default login` leaves behind, and what Cloud
   Run, App Engine and Compute Engine provide ambiently. This is the easiest
   way to develop locally with no key: sign in once with your own Google
   account and the Admin SDK picks it up.
   -------------------------------------------------------------------------- */

function gcloudCredentialsPath(): string | null {
  const base =
    process.platform === "win32"
      ? process.env.APPDATA && join(process.env.APPDATA, "gcloud")
      : process.env.HOME && join(process.env.HOME, ".config", "gcloud");
  if (!base) return null;
  const file = join(base, "application_default_credentials.json");
  return existsSync(file) ? file : null;
}

function hasApplicationDefault(): boolean {
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) return true;
  // Set by Cloud Run, Cloud Functions and App Engine respectively.
  if (process.env.K_SERVICE || process.env.FUNCTION_TARGET || process.env.GAE_ENV) return true;
  return gcloudCredentialsPath() !== null;
}

/* --- Resolution ------------------------------------------------------------ */

export type CredentialMode = "key" | "workload-identity" | "application-default" | "none";

function resolveMode(): CredentialMode {
  if (!projectId) return "none";
  if (clientEmail && privateKey) return "key";
  if (wifAudience && wifServiceAccount) return "workload-identity";
  if (hasApplicationDefault()) return "application-default";
  return "none";
}

export const credentialMode: CredentialMode = resolveMode();
export const isConfigured = credentialMode !== "none";

/** What the admin panel shows when it cannot reach Firestore, so the fix is
    the next thing read rather than something to go looking for. */
export function credentialHelp(): string {
  if (!projectId) return "FIREBASE_PROJECT_ID is not set.";
  return (
    "No Google credential was found. Use any one of: a service account key " +
    "(FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY); workload identity federation " +
    "(GCP_WORKLOAD_IDENTITY_AUDIENCE and GCP_SERVICE_ACCOUNT_EMAIL), which needs no key and is " +
    "the route when your organization blocks key creation; or application default credentials, " +
    "locally via `gcloud auth application-default login`. See docs/SETUP.md section 2."
  );
}

let cachedApp: App | null = null;

function app(): App {
  if (!isConfigured) throw new Error(credentialHelp());
  if (cachedApp) return cachedApp;

  const existing = getApps().find((a) => a.name === APP_NAME);
  if (existing) {
    cachedApp = existing;
    return cachedApp;
  }

  let credential: Credential;
  switch (credentialMode) {
    case "key":
      credential = cert({ projectId: projectId!, clientEmail: clientEmail!, privateKey: privateKey! });
      break;
    case "workload-identity":
      credential = federatedCredential(wifAudience!, wifServiceAccount!);
      break;
    default:
      credential = applicationDefault();
  }

  cachedApp = initializeApp(
    {
      credential,
      projectId: projectId!,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    },
    APP_NAME
  );
  return cachedApp;
}

let cachedDb: Firestore | null = null;

export function db(): Firestore {
  if (cachedDb) return cachedDb;
  cachedDb = getFirestore(app());
  cachedDb.settings({ ignoreUndefinedProperties: true });
  return cachedDb;
}

export function auth(): Auth {
  return getAuth(app());
}

/** Fails soft: returns null rather than throwing when unconfigured. */
export function tryDb(): Firestore | null {
  if (!isConfigured) return null;
  try {
    return db();
  } catch {
    return null;
  }
}

/* --- Authorisation --------------------------------------------------------
   An account may edit the site only if its verified email is on the
   allowlist. The allowlist lives in an environment variable rather than in
   Firestore, so an attacker who reaches the database cannot grant themselves
   access by writing a document.
   ------------------------------------------------------------------------ */

export function adminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmail(email: string | undefined | null): boolean {
  if (!email) return false;
  const list = adminEmails();
  if (list.length === 0) return false;
  return list.includes(email.toLowerCase());
}

export interface AdminUser {
  uid: string;
  email: string;
  name?: string;
}

/**
 * Verifies a Firebase ID token and checks it against the allowlist.
 * Returns null for anything that is not a currently valid admin session.
 */
export async function verifyAdmin(idToken: string): Promise<AdminUser | null> {
  if (!isConfigured) return null;
  try {
    const decoded = await auth().verifyIdToken(idToken, true);
    if (!decoded.email || !isAdminEmail(decoded.email)) return null;
    // An unverified address must not be able to claim an allowlisted email.
    if (decoded.email_verified === false) return null;
    return {
      uid: decoded.uid,
      email: decoded.email,
      name: typeof decoded.name === "string" ? decoded.name : undefined,
    };
  } catch {
    return null;
  }
}
