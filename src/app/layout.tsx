import type { Metadata, Viewport } from "next";

import "@/styles/globals.css";
import { getSettings } from "@/lib/content";

/* ============================================================================
   Root layout.

   All four faces are declared in globals.css and served from public/fonts on
   this origin. Nothing is fetched from Google at build time or at run time.

   They used to come through next/font/google, which downloads and parses CSS
   from Google during the build. When Google answers with anything the parser
   does not expect, it throws "Cannot read properties of null" and the build
   fails — which is how a Vercel deployment died, after two local builds had
   already failed the same way. A font should not be able to break a deploy.

   Each face declares `font-display: swap`, so text is readable immediately
   in the fallback and swaps when the face arrives.
   ========================================================================= */

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#33332C",
};

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  return {
    metadataBase: new URL(settings.seo.siteUrl),
    title: {
      default: `${settings.organization} — asset performance advisory`,
      template: settings.seo.titleTemplate,
    },
    description: settings.seo.defaultDescription,
    applicationName: settings.organization,
    icons: {
      icon: [{ url: "/brand/adaptis-favicon-a.svg", type: "image/svg+xml" }],
    },
    openGraph: {
      type: "website",
      siteName: settings.organization,
      url: settings.seo.siteUrl,
      description: settings.seo.defaultDescription,
    },
    robots: { index: true, follow: true },
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className="no-js"
    >
      <head>
        {/* Runs before first paint. The loader curtain is lifted by script,
            so without script it is never drawn in the first place. */}
        <script
          dangerouslySetInnerHTML={{
            __html: "document.documentElement.classList.remove('no-js')",
          }}
        />
        {/* Elms Sans is self-hosted too, declared in globals.css. It used to
            be fetched from Google Fonts as a preload that a string `onLoad`
            promoted to a stylesheet — a plain-HTML trick React refuses, so
            the promotion never ran and the face never loaded. Nothing here
            reaches a third party now.

            The preload matters: the home headline is the largest paint on
            the page and is set in this face, so with `swap` it would paint
            once in the fallback and again when Elms arrived, and the second
            paint is the one that counts. Fetching it up front closes that
            gap. */}
        <link
          rel="preload"
          as="font"
          type="font/woff2"
          href="/fonts/elms-sans-latin.woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
