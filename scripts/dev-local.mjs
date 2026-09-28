import { spawn } from "node:child_process";

/* ============================================================================
   Next, pointed at the local Firestore emulator.

   The emulator authenticates nothing, so the whole site and admin panel run
   with no Google credential of any kind. That is the point: it is the one
   way to work on this before a service account key, workload identity or a
   gcloud login is in place.

   Data lives in .emulator/ and is exported on exit, so what you write in the
   panel survives a restart. It is not the production database, and nothing
   written here reaches it.

   Set the variable here rather than inline in package.json, because the shell
   syntax for that differs between Windows and everything else.
   ========================================================================= */

const HOST = process.env.FIRESTORE_EMULATOR_HOST ?? "127.0.0.1:8080";

const [, , ...rest] = process.argv;
const command = rest.length > 0 ? rest : ["dev"];

console.log(`\nFirestore emulator expected at ${HOST}`);
console.log("Start it in another terminal with:  npm run emulator\n");

const child = spawn("npx", ["next", ...command], {
  stdio: "inherit",
  shell: true,
  env: {
    ...process.env,
    FIRESTORE_EMULATOR_HOST: HOST,
    // Sessions are signed with this. A fixed value locally means a restart
    // does not sign you out mid-task.
    ADMIN_SESSION_SECRET: process.env.ADMIN_SESSION_SECRET ?? "local-development-session-secret",
  },
});

child.on("exit", (code) => process.exit(code ?? 0));
