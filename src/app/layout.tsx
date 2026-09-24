import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Source_Serif_4 } from "next/font/google";

import "@/styles/globals.css";
import { getSettings } from "@/lib/content";

/* ============================================================================
   Root layout.

   Three of the four faces are self-hosted at build time through next/font:
   the files are served from this origin, so there is no DNS lookup, no
   connection to a third party and no render-blocking stylesheet before text
   can paint. `display: swap` means text is readable immediately in the
   fallback and swaps when the face arrives.

   Elms Sans is the exception. It is the brand's marketing hero face and may
   not exist on a public host at all, so it is requested separately and
   falls back to Source Serif 4 — which is what the reference build shipped.
   A failed request there cannot take the other three down with it.
   Self-host it in production; see docs/SETUP.md.
   ========================================================================= */

const geist = Geist({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
  variable: "--font-geist",
  fallback: ["system-ui", "Segoe UI", "sans-serif"],
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
  variable: "--font-geist-mono",
  fallback: ["ui-monospace", "SFMono-Regular", "monospace"],
});

const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  weight: ["400", "600"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-source-serif",
  fallback: ["Georgia", "serif"],
});

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
      className={`no-js ${geist.variable} ${geistMono.variable} ${sourceSerif.variable}`}
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
