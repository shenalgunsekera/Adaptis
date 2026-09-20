import type { Metadata, Viewport } from "next";

import "@/styles/globals.css";
import { getSettings } from "@/lib/content";

/* ============================================================================
   Root layout.

   Fonts load in two requests on purpose. Geist, Geist Mono and Source Serif 4
   are known-good on Google Fonts. Elms Sans, the brand's marketing hero face,
   is requested separately: if it is unavailable the display face falls back to
   Source Serif 4, which is exactly what the reference build shipped, and the
   other three still load. A single combined request would fail as a whole.

   Both are a draft arrangement. Self-host all four in production; see
   docs/SETUP.md.
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
    <html lang="en" className="no-js">
      <head>
        {/* Runs before first paint. The loader curtain is lifted by script,
            so without script it is never drawn in the first place. */}
        <script
          dangerouslySetInnerHTML={{
            __html: "document.documentElement.classList.remove('no-js')",
          }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600&family=Geist+Mono:wght@400;500&family=Source+Serif+4:opsz,wght@8..60,400;8..60,600&display=swap"
        />
        {/* Requested on its own so an unavailable family cannot take the others down. */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Elms+Sans:wght@400;500;600&display=swap"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
