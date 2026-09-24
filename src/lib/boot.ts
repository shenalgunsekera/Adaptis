/**
 * Whether the page-load intro has already played in this session, and how
 * long the editor has set it to hold.
 *
 * The loader runs once per full page load, not on client-side navigation, so
 * the hero holds its entrance behind the curtain on a hard load and starts
 * immediately on every route change after that.
 *
 * `curtainMs` is written by the loader as it renders, because the duration is
 * editable in the admin panel and the hero has to be timed against whatever
 * it has been set to. Zero means no curtain is playing at all — either the
 * editor switched it off, or this is a client-side navigation.
 */
export const boot = { done: false, curtainMs: 1150 };

/** How long after the curtain begins to hold before it starts sliding away:
    the hold itself, then the brief settle the loader waits out at 100%. */
const SETTLE_S = 0.18;

/** The longest entrance in the hero group.

    The hero runs its entrance *behind* the curtain and finishes as the
    curtain begins to lift, so what the reader sees revealed is a headline
    already in place rather than an empty frame that then fills. Nothing about
    this is visible while it happens — which is the point, and also why the
    page is measurably ready sooner for it. */
const ENTRANCE_S = 0.8;

/** Delay for an entrance that should complete behind the curtain. */
export function heroDelay(extra = 0): number {
  if (boot.done || boot.curtainMs <= 0) return 0.1 + extra;
  const lift = boot.curtainMs / 1000 + SETTLE_S;
  return Math.max(0.15, lift - ENTRANCE_S) + extra;
}
