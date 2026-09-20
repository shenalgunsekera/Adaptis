/**
 * Whether the page-load intro has already played in this session.
 *
 * The loader runs once per full page load, not on client-side navigation, so
 * the hero holds its entrance behind the curtain on a hard load and starts
 * immediately on every route change after that.
 */
export const boot = { done: false };

/** Delay for an entrance that should wait for the curtain to lift. */
export function heroDelay(extra = 0): number {
  return (boot.done ? 0.1 : 1.35) + extra;
}
