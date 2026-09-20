import "server-only";

import { cert, getApp, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

/* ============================================================================
   Firebase Admin, server side.

   Deliberately tolerant of missing configuration. The public site must render
   from its seed content when Firestore is unreachable or not yet set up, so
   nothing here throws at import time: callers check `isConfigured` and fall
   back. The admin panel, which cannot fall back, surfaces the error instead.
   ========================================================================= */

const APP_NAME = "adaptis-admin";

function readPrivateKey(): string | undefined {
  const key = process.env.FIREBASE_PRIVATE_KEY;
  if (!key) return undefined;
  // Vercel stores the key with escaped newlines; a .env.local file may hold
  // either form. Normalise both, and strip wrapping quotes if present.
  return key.replace(/^["']|["']$/g, "").replace(/\\n/g, "\n");
}

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = readPrivateKey();

export const isConfigured = Boolean(projectId && clientEmail && privateKey);

let cachedApp: App | null = null;

function app(): App {
  if (!isConfigured) {
    throw new Error(
      "Firebase Admin is not configured. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY."
    );
  }
  if (cachedApp) return cachedApp;

  const existing = getApps().find((a) => a.name === APP_NAME);
  cachedApp =
    existing ??
    initializeApp(
      {
        credential: cert({
          projectId: projectId!,
          clientEmail: clientEmail!,
          privateKey: privateKey!,
        }),
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
