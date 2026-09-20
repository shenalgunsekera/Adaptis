import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ScrollProgress, SmoothScroll } from "@/components/motion/SmoothScroll";
import { PageLoader } from "@/components/motion/PageLoader";
import { SectionRenderer } from "@/components/sections/SectionRenderer";
import { getAllPages, getPage, getSettings } from "@/lib/content";

/* ============================================================================
   Every public page.

   One route serves all eleven, because a page is data: an ordered list of
   sections held in Firestore and edited in the admin panel. Adding a page is
   a content operation, not a code change.
   ========================================================================= */

export const revalidate = 300;
export const dynamicParams = true;

interface Props {
  params: Promise<{ slug?: string[] }>;
}

function toSlug(parts?: string[]): string {
  return (parts ?? []).join("/");
}

export async function generateStaticParams() {
  const pages = await getAllPages();
  return pages.map((p) => ({ slug: p.slug === "" ? [] : p.slug.split("/") }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPage(toSlug(slug));
  if (!page) return {};

  const settings = await getSettings();
  const url = `${settings.seo.siteUrl}${page.slug ? `/${page.slug}` : ""}`;

  return {
    // The home page's title already names the firm, so it bypasses the
    // "%s · Adaptis" template rather than repeating it.
    title: page.slug === "" ? { absolute: page.seo.title } : page.seo.title,
    description: page.seo.description,
    alternates: { canonical: url },
    robots: page.seo.noindex ? { index: false, follow: false } : undefined,
    openGraph: {
      title: page.seo.title,
      description: page.seo.description,
      url,
      images: page.seo.ogImage?.src ? [{ url: page.seo.ogImage.src }] : undefined,
    },
  };
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const path = toSlug(slug);

  const [page, settings] = await Promise.all([getPage(path), getSettings()]);
  if (!page) notFound();

  return (
    <>
      {/* Visible only to a keyboard tab, never on a pointer device. */}
      <a className="skip" href="#main">
        Skip to content
      </a>

      <PageLoader line={settings.footer.closingLine} />
      <SmoothScroll />
      <ScrollProgress />

      <Header settings={settings} />

      <main id="main">
        {page.sections.map((section) => (
          <SectionRenderer key={section.id} section={section} />
        ))}
      </main>

      <Footer settings={settings} />
    </>
  );
}
