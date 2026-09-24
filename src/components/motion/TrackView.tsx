"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

/* ============================================================================
   Records one view per page.

   Fires after paint, never blocks anything, and is sent with sendBeacon so a
   reader who leaves immediately is still counted without the request holding
   the page open. A failure is swallowed: counting must never affect the page
   being counted.

   Honours Do Not Track. Nothing identifying is sent either way — the body is
   a path this site already serves.
   ========================================================================= */

export function TrackView() {
  const pathname = usePathname();
  const last = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname || last.current === pathname) return;
    last.current = pathname;

    const nav = navigator as Navigator & { doNotTrack?: string; msDoNotTrack?: string };
    const win = window as Window & { doNotTrack?: string };
    const dnt = nav.doNotTrack ?? win.doNotTrack ?? nav.msDoNotTrack;
    if (dnt === "1" || dnt === "yes") return;

    const body = JSON.stringify({ path: pathname });

    const send = () => {
      try {
        const blob = new Blob([body], { type: "application/json" });
        if (!navigator.sendBeacon?.("/api/track", blob)) {
          void fetch("/api/track", {
            method: "POST",
            body,
            headers: { "Content-Type": "application/json" },
            keepalive: true,
          }).catch(() => undefined);
        }
      } catch {
        /* never surfaced */
      }
    };

    // After paint, so it cannot compete with anything the reader is waiting for.
    const id = window.requestIdleCallback?.(send, { timeout: 2000 }) ?? window.setTimeout(send, 800);
    return () => {
      if (window.cancelIdleCallback) window.cancelIdleCallback(id as number);
      else window.clearTimeout(id as number);
    };
  }, [pathname]);

  return null;
}
