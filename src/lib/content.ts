import "server-only";

import { unstable_cache, revalidateTag } from "next/cache";

import { credentialHelp, tryDb } from "@/lib/firebase/admin";
import type { Page, SiteSettings, ContactSubmission, Engagement, DayStats } from "@/lib/types";
import { pageSeeds, pageSeedBySlug, siteSeed } from "@/content";

/* ============================================================================
   Content repository.

   Firestore is the source of truth once it holds content. Until then, and any
   time it cannot be reached, the seed in src/content is served instead. The
   site therefore renders correctly on a clean checkout with no credentials,
   and a database outage degrades to the last shipped copy rather than to an
   error page.

   Reads are cached and tagged, so an edit in the admin panel revalidates only
   what it touched.
   ========================================================================= */

export const TAG_PAGES = "pages";
export const TAG_SETTINGS = "settings";

/** Firestore cannot store undefined; the seed occasionally omits optionals. */
function clean<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

/** Slugs are stored with "/" replaced, since a document id cannot contain one. */
export function slugToDocId(slug: string): string {
  return slug === "" ? "home" : slug.replace(/\//g, "__");
}

export function docIdToSlug(id: string): string {
  return id === "home" ? "" : id.replace(/__/g, "/");
}

/* --- Pages ---------------------------------------------------------------- */

async function fetchPage(slug: string): Promise<Page | null> {
  const seed = pageSeedBySlug[slug] ?? null;
  const database = tryDb();
  if (!database) return seed;

  try {
    const snap = await database.collection("pages").doc(slugToDocId(slug)).get();
    if (!snap.exists) return seed;
    const data = snap.data() as Page | undefined;
    if (!data || !Array.isArray(data.sections)) return seed;
    return data;
  } catch (error) {
    console.error(`[content] page "${slug}" fell back to seed:`, error);
    return seed;
  }
}

export const getPage = (slug: string) =>
  unstable_cache(() => fetchPage(slug), ["page", slug], {
    tags: [TAG_PAGES, `page:${slug}`],
    revalidate: 300,
  })();

async function fetchAllPages(): Promise<Page[]> {
  const database = tryDb();
  if (!database) return pageSeeds;

  try {
    const snap = await database.collection("pages").get();
    if (snap.empty) return pageSeeds;

    const stored = new Map<string, Page>();
    snap.forEach((doc) => {
      const data = doc.data() as Page | undefined;
      if (data && Array.isArray(data.sections)) {
        stored.set(docIdToSlug(doc.id), data);
      }
    });

    // Seed order is the navigation order and is authoritative; stored pages
    // replace their seed in place, and any extra page is appended.
    const merged = pageSeeds.map((p) => stored.get(p.slug) ?? p);
    for (const [slug, page] of stored) {
      if (!pageSeedBySlug[slug]) merged.push(page);
    }
    return merged;
  } catch (error) {
    console.error("[content] page list fell back to seed:", error);
    return pageSeeds;
  }
}

export const getAllPages = () =>
  unstable_cache(fetchAllPages, ["pages"], {
    tags: [TAG_PAGES],
    revalidate: 300,
  })();

/* --- Settings ------------------------------------------------------------- */

async function fetchSettings(): Promise<SiteSettings> {
  const database = tryDb();
  if (!database) return siteSeed;

  try {
    const snap = await database.collection("settings").doc("site").get();
    if (!snap.exists) return siteSeed;
    const data = snap.data() as SiteSettings | undefined;
    if (!data || !Array.isArray(data.nav)) return siteSeed;
    return data;
  } catch (error) {
    console.error("[content] settings fell back to seed:", error);
    return siteSeed;
  }
}

export const getSettings = () =>
  unstable_cache(fetchSettings, ["settings"], {
    tags: [TAG_SETTINGS],
    revalidate: 300,
  })();

/* --- Writes (admin only; callers must have verified the session) ---------- */

export async function savePage(page: Page, editor: string): Promise<void> {
  const database = tryDb();
  if (!database) throw new Error(credentialHelp());

  const payload = clean({
    ...page,
    updatedAt: new Date().toISOString(),
    updatedBy: editor,
  });

  await database.collection("pages").doc(slugToDocId(page.slug)).set(payload);
  revalidateTag(TAG_PAGES);
  revalidateTag(`page:${page.slug}`);
}

export async function saveSettings(settings: SiteSettings): Promise<void> {
  const database = tryDb();
  if (!database) throw new Error(credentialHelp());

  await database.collection("settings").doc("site").set(clean(settings));
  revalidateTag(TAG_SETTINGS);
}

/* --- Contact submissions -------------------------------------------------- */

export async function listSubmissions(limit = 100): Promise<ContactSubmission[]> {
  const database = tryDb();
  if (!database) return [];

  const snap = await database
    .collection("contactSubmissions")
    .orderBy("createdAt", "desc")
    .limit(limit)
    .get();

  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<ContactSubmission, "id">) }));
}

export async function updateSubmission(
  id: string,
  patch: Partial<Pick<ContactSubmission, "read" | "archived">>
): Promise<void> {
  const database = tryDb();
  if (!database) throw new Error(credentialHelp());
  await database.collection("contactSubmissions").doc(id).update(patch);
}

export async function deleteSubmission(id: string): Promise<void> {
  const database = tryDb();
  if (!database) throw new Error(credentialHelp());
  await database.collection("contactSubmissions").doc(id).delete();
}

/* --- Engagement ------------------------------------------------------------
   Counts only, aggregated per day. Nothing here identifies a reader.
   -------------------------------------------------------------------------- */

export async function getEngagement(days = 30): Promise<Engagement> {
  const empty: Engagement = {
    days: [],
    totals: { views: 0, enquiries: 0, conversion: 0 },
    topPages: [],
  };

  const database = tryDb();
  if (!database) return empty;

  const since = new Date();
  since.setDate(since.getDate() - (days - 1));
  const from = since.toISOString().slice(0, 10);

  try {
    const snap = await database
      .collection("analytics")
      .orderBy("__name__")
      .startAt(from)
      .get();

    const rows: DayStats[] = snap.docs.map((d) => {
      const data = d.data() as Partial<DayStats>;
      return {
        id: d.id,
        views: data.views ?? 0,
        enquiries: data.enquiries ?? 0,
        paths: (data.paths as Record<string, number>) ?? {},
      };
    });

    const views = rows.reduce((n, r) => n + r.views, 0);
    const enquiries = rows.reduce((n, r) => n + r.enquiries, 0);

    const byPath = new Map<string, number>();
    for (const r of rows) {
      for (const [k, v] of Object.entries(r.paths)) {
        byPath.set(k, (byPath.get(k) ?? 0) + v);
      }
    }

    return {
      days: rows,
      totals: {
        views,
        enquiries,
        conversion: views ? Number(((enquiries / views) * 100).toFixed(2)) : 0,
      },
      topPages: [...byPath.entries()]
        .map(([path, v]) => ({ path: path === "home" ? "/" : "/" + path.replace(/__/g, "/"), views: v }))
        .sort((a, b) => b.views - a.views),
    };
  } catch (error) {
    console.error("[engagement] read failed:", error);
    return empty;
  }
}
