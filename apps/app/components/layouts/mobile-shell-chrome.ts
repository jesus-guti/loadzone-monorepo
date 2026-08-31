/**
 * Shared mobile shell chrome: FABs sit above the bottom nav.
 * Keep FAB `bottom` and main scroll padding in lockstep.
 */
export const MOBILE_SHELL_FAB_BOTTOM_CLASS =
  "bottom-[calc(env(safe-area-inset-bottom)+4.5rem)]";

/** Bottom nav (~4.5rem) + FAB (2.75rem) + 1rem gap so last content is tappable. */
export const MOBILE_SHELL_SCROLL_PB_CLASS =
  "pb-[calc(env(safe-area-inset-bottom)+8.25rem)] md:pb-0";
