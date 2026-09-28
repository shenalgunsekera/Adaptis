import "server-only";

import { randomUUID } from "node:crypto";

import { tryDb } from "@/lib/firebase/admin";
import { hashPassword, isWeakPassword, verifyPassword } from "@/lib/auth/password";

/* ============================================================================
   Editor accounts.

   Email and password, held by this application rather than by an identity
   provider, so signing in does not depend on Google Identity at all.

   Accounts live in Firestore, collection `adminUsers`, so they are shared by
   every instance and survive a deploy. Firestore being reachable is therefore
   a precondition for signing in, and the sign-in route says exactly that
   rather than reporting a wrong password.

   The bootstrap account is created on first use, so a fresh database is never
   locked out of its own admin panel. Its password is an ordinary password,
   not a bypass: it is hashed like any other, it can be changed, and the
   account can be deleted once a second one exists.
   ========================================================================= */

export const ADMINS_COLLECTION = "adminUsers";

export class FirestoreUnavailable extends Error {
  constructor() {
    super("Firestore is not reachable, so editor accounts cannot be read.");
    this.name = "FirestoreUnavailable";
  }
}

export interface AdminAccount {
  id: string;
  email: string;
  name?: string;
  passwordHash: string;
  createdAt: string;
  createdBy?: string;
  lastSignInAt?: string;
  /** Recorded when the password is set, because a hash cannot be asked
      afterwards whether what produced it was any good. */
  weakPassword?: boolean;
}

/** Everything but the hash. Nothing else may leave the server. */
export interface AdminSummary {
  id: string;
  email: string;
  name?: string;
  createdAt: string;
  createdBy?: string;
  lastSignInAt?: string;
  weakPassword: boolean;
}

export const BOOTSTRAP_EMAIL = (
  process.env.ADMIN_BOOTSTRAP_EMAIL ?? "admin@adaptis.ca"
).toLowerCase();

const BOOTSTRAP_PASSWORD = process.env.ADMIN_BOOTSTRAP_PASSWORD ?? "123456";

export function normaliseEmail(email: string): string {
  return email.trim().toLowerCase();
}

function database() {
  const db = tryDb();
  if (!db) throw new FirestoreUnavailable();
  return db;
}

/* --- Reads ----------------------------------------------------------------- */

async function loadAll(): Promise<AdminAccount[]> {
  const snap = await database().collection(ADMINS_COLLECTION).get();
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<AdminAccount, "id">) }));
}

/** Creates the bootstrap account the first time there are none, so a new
    deployment is never locked out of its own admin panel. */
async function ensureBootstrap(): Promise<void> {
  const db = database();
  const existing = await db.collection(ADMINS_COLLECTION).limit(1).get();
  if (!existing.empty) return;

  const account: AdminAccount = {
    id: randomUUID(),
    email: BOOTSTRAP_EMAIL,
    name: "Administrator",
    passwordHash: await hashPassword(BOOTSTRAP_PASSWORD),
    createdAt: new Date().toISOString(),
    createdBy: "bootstrap",
    weakPassword: isWeakPassword(BOOTSTRAP_PASSWORD),
  };

  const { id, ...rest } = account;
  // create() rather than set(): if two instances start at once the second
  // fails rather than overwriting an account whose password may have been
  // changed in between.
  await db
    .collection(ADMINS_COLLECTION)
    .doc(id)
    .create(rest)
    .catch(() => undefined);
}

function summarise(a: AdminAccount): AdminSummary {
  return {
    id: a.id,
    email: a.email,
    name: a.name,
    createdAt: a.createdAt,
    createdBy: a.createdBy,
    lastSignInAt: a.lastSignInAt,
    weakPassword: a.weakPassword === true,
  };
}

export async function listAdmins(): Promise<AdminSummary[]> {
  await ensureBootstrap();
  const all = await loadAll();
  return all.map(summarise).sort((a, b) => a.email.localeCompare(b.email));
}

export async function findByEmail(email: string): Promise<AdminAccount | null> {
  await ensureBootstrap();
  const target = normaliseEmail(email);
  const snap = await database()
    .collection(ADMINS_COLLECTION)
    .where("email", "==", target)
    .limit(1)
    .get();
  if (snap.empty) return null;
  const doc = snap.docs[0];
  return { id: doc.id, ...(doc.data() as Omit<AdminAccount, "id">) };
}

export async function findById(id: string): Promise<AdminAccount | null> {
  const doc = await database().collection(ADMINS_COLLECTION).doc(id).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...(doc.data() as Omit<AdminAccount, "id">) };
}

export async function countAdmins(): Promise<number> {
  await ensureBootstrap();
  return (await loadAll()).length;
}

/* --- Writes ---------------------------------------------------------------- */

async function persist(account: AdminAccount): Promise<void> {
  const { id, ...rest } = account;
  await database().collection(ADMINS_COLLECTION).doc(id).set(rest, { merge: true });
}

export async function createAdmin(input: {
  email: string;
  password: string;
  name?: string;
  createdBy: string;
}): Promise<{ ok: true; admin: AdminSummary } | { ok: false; error: string }> {
  const email = normaliseEmail(input.email);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, error: "That address does not look complete." };
  }
  if (await findByEmail(email)) {
    return { ok: false, error: "An editor with that address already exists." };
  }

  const account: AdminAccount = {
    id: randomUUID(),
    email,
    name: input.name?.trim() || undefined,
    passwordHash: await hashPassword(input.password),
    createdAt: new Date().toISOString(),
    createdBy: input.createdBy,
    weakPassword: isWeakPassword(input.password),
  };

  await persist(account);
  return { ok: true, admin: summarise(account) };
}

export async function setPassword(id: string, password: string): Promise<boolean> {
  const account = await findById(id);
  if (!account) return false;
  await persist({
    ...account,
    passwordHash: await hashPassword(password),
    weakPassword: isWeakPassword(password),
  });
  return true;
}

export async function renameAdmin(id: string, name: string): Promise<boolean> {
  const account = await findById(id);
  if (!account) return false;
  await persist({ ...account, name: name.trim() || undefined });
  return true;
}

export async function deleteAdmin(id: string): Promise<{ ok: boolean; error?: string }> {
  const all = await loadAll();
  if (all.length <= 1) {
    return { ok: false, error: "This is the only editor. Add another before removing this one." };
  }
  if (!all.some((a) => a.id === id)) return { ok: false, error: "No such editor." };

  await database().collection(ADMINS_COLLECTION).doc(id).delete();
  return { ok: true };
}

export async function recordSignIn(id: string): Promise<void> {
  await database()
    .collection(ADMINS_COLLECTION)
    .doc(id)
    .set({ lastSignInAt: new Date().toISOString() }, { merge: true })
    .catch(() => undefined);
}

/* --- Authentication -------------------------------------------------------- */

export interface SignInResult {
  account: AdminAccount;
  /** True while the account still has the password it was created with. */
  usingBootstrapPassword: boolean;
}

export async function authenticate(email: string, password: string): Promise<SignInResult | null> {
  const account = await findByEmail(email);

  if (!account) {
    // Spend comparable time on a missing account, so the response time does
    // not reveal which addresses exist.
    await verifyPassword(password, await hashPassword("no-such-account"));
    return null;
  }

  if (!(await verifyPassword(password, account.passwordHash))) return null;

  return {
    account,
    usingBootstrapPassword:
      normaliseEmail(account.email) === BOOTSTRAP_EMAIL &&
      (await verifyPassword(BOOTSTRAP_PASSWORD, account.passwordHash)),
  };
}
