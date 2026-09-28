import "server-only";

import { randomBytes, scrypt as scryptCb, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(scryptCb) as (
  password: string | Buffer,
  salt: string | Buffer,
  keylen: number,
  options?: { N?: number; r?: number; p?: number; maxmem?: number }
) => Promise<Buffer>;

/* ============================================================================
   Password hashing.

   scrypt from node:crypto rather than bcrypt or argon2, because both of those
   are native modules that have to compile, and this needs to run on Vercel's
   runtime without a build step of its own. scrypt is memory-hard and is what
   Node ships for exactly this purpose.

   Stored as one self-describing string, so the cost parameters travel with
   the hash and can be raised later without invalidating existing passwords:

     scrypt$N$r$p$<salt base64>$<hash base64>

   A password is never stored, logged or returned by any API in this codebase.
   ========================================================================= */

/** Cost. N=2^15 keeps a single verification comfortably under ~100ms on the
    kind of instance this runs on, while costing an attacker 32MB per guess. */
const N = 32768;
const R = 8;
const P = 1;
const KEYLEN = 32;
const SALT_BYTES = 16;

/** scrypt needs headroom above 128 * N * r bytes or Node refuses outright. */
const MAXMEM = 256 * N * R;

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(SALT_BYTES);
  const derived = await scrypt(password.normalize("NFKC"), salt, KEYLEN, {
    N,
    r: R,
    p: P,
    maxmem: MAXMEM,
  });
  return [
    "scrypt",
    N,
    R,
    P,
    salt.toString("base64"),
    derived.toString("base64"),
  ].join("$");
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  try {
    const parts = stored.split("$");
    if (parts.length !== 6 || parts[0] !== "scrypt") return false;

    const n = Number(parts[1]);
    const r = Number(parts[2]);
    const p = Number(parts[3]);
    if (!Number.isFinite(n) || !Number.isFinite(r) || !Number.isFinite(p)) return false;

    const salt = Buffer.from(parts[4], "base64");
    const expected = Buffer.from(parts[5], "base64");

    const derived = await scrypt(password.normalize("NFKC"), salt, expected.length, {
      N: n,
      r,
      p,
      maxmem: Math.max(MAXMEM, 256 * n * r),
    });

    // Lengths are equal by construction above, but timingSafeEqual throws if
    // they are not, and a throw here would read as "wrong password" anyway.
    return derived.length === expected.length && timingSafeEqual(derived, expected);
  } catch {
    return false;
  }
}

/* --- Password quality -------------------------------------------------------
   Deliberately light. This gate exists to stop the genuinely indefensible,
   not to impose composition rules that push people towards Passw0rd! — long
   is what matters, and the panel reports weak passwords rather than refusing
   to let anyone in with one.
   -------------------------------------------------------------------------- */

/** Passwords common enough that an attacker tries them before anything else. */
const TOP_PASSWORDS = new Set([
  "123456",
  "password",
  "12345678",
  "qwerty",
  "123456789",
  "12345",
  "1234",
  "111111",
  "1234567",
  "dragon",
  "123123",
  "abc123",
  "letmein",
  "monkey",
  "admin",
  "adaptis",
  "password1",
  "welcome",
  "iloveyou",
  "sunshine",
]);

export const MIN_PASSWORD = 8;

/** Null when the password is acceptable, otherwise why it is not. */
export function passwordProblem(password: string): string | null {
  if (password.length < MIN_PASSWORD) {
    return `Use at least ${MIN_PASSWORD} characters.`;
  }
  return null;
}

/** Acceptable, but weak enough that the panel should keep saying so. */
export function isWeakPassword(password: string): boolean {
  const lowered = password.toLowerCase();
  return password.length < 12 || TOP_PASSWORDS.has(lowered);
}
