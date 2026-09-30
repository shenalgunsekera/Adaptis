import "server-only";

/* ============================================================================
   Where this deployment actually answers.

   Distinct from `settings.seo.siteUrl`, deliberately. That one is the address
   the site claims in canonical URLs, the sitemap and structured data, and it
   is set to the domain the site is *meant* to live at — which may be pointed
   somewhere else entirely until launch day.

   A link in a notification email has to reach the panel today. Sending an
   editor to the intended domain before it resolves here produces a 404 from
   whatever is currently parked on it, which is exactly what happened.

   So: the host's own idea of this deployment first, the configured address
   only as a fallback for somewhere that tells us nothing.
   ========================================================================= */

export function deploymentUrl(configured?: string): string | undefined {
  // Vercel: the production domain, which becomes the custom domain once one
  // is assigned, so this keeps working after launch rather than pinning the
  // link to a *.vercel.app address for ever.
  const production = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (production) return `https://${production}`;

  // A preview or branch deployment, so a notification from one links back to
  // itself rather than to production.
  const deployment = process.env.VERCEL_URL;
  if (deployment) return `https://${deployment}`;

  const explicit = process.env.SITE_URL;
  if (explicit) return explicit.replace(/\/+$/, "");

  return configured?.replace(/\/+$/, "") || undefined;
}

/** Absolute address of a path on this deployment, or undefined when there is
    no address worth putting in an email. */
export function absoluteUrl(path: string, configured?: string): string | undefined {
  const base = deploymentUrl(configured);
  if (!base) return undefined;
  try {
    return new URL(path, base).toString();
  } catch {
    return undefined;
  }
}
