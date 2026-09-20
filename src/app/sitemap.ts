import type { MetadataRoute } from "next";

import { getAllPages, getSettings } from "@/lib/content";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [pages, settings] = await Promise.all([getAllPages(), getSettings()]);
  const base = settings.seo.siteUrl.replace(/\/$/, "");

  return pages
    .filter((p) => !p.seo.noindex)
    .map((p) => ({
      url: `${base}${p.slug ? `/${p.slug}` : ""}`,
      lastModified: p.updatedAt ? new Date(p.updatedAt) : new Date(),
      // The home page and the five pillar pages are the entry points that
      // matter; depth below that is deliberately shallow.
      changeFrequency: "monthly" as const,
      priority: p.slug === "" ? 1 : p.slug.startsWith("what-we-do") ? 0.8 : 0.6,
    }));
}
