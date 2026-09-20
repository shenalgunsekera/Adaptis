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
        {/* Elms Sans only; the other three are self-hosted above.

            Loaded without blocking the render: a stylesheet in the head
            holds first paint until it answers, and this one is a request to
            a third party for a face that may not exist. It is fetched as a
            preload and promoted to a stylesheet once it lands, so the page
            paints immediately in Source Serif 4 and swaps if Elms arrives. */}
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="preload"
          as="style"
          href="https://fonts.googleapis.com/css2?family=Elms+Sans:wght@400;500;600&display=swap"
          // eslint-disable-next-line react/no-unknown-property
          onLoad={`this.onload=null;this.rel='stylesheet'` as unknown as undefined}
        />
        <noscript>
          <link
            rel="stylesheet"
            href="https://fonts.googleapis.com/css2?family=Elms+Sans:wght@400;500;600&display=swap"
          />
        </noscript>
      </head>
      <body>{children}</body>
    </html>
  );
}
