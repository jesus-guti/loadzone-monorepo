/**
 * Bottom clearance for the player session page when a Focus-frame form shows
 * its fixed Guardar bar. Use real CSS classes (not Tailwind arbitrary
 * `calc(...+env())` utilities — those were compiling to padding-bottom: 0).
 * Sized to clear progress + h-14 CTA + safe-area so the injury report footer
 * trigger stays visible and tappable (JES-80).
 */
export const SESSION_FIXED_SAVE_CLEARANCE_CLASS =
  "session-fixed-save-clearance";

export const SESSION_DEFAULT_BOTTOM_PADDING_CLASS = "pb-10";

/** Fixed save chrome padding — keeps Guardar above the home indicator. */
export const FIXED_SAVE_CTA_INNER_CLASS =
  "pointer-events-auto mx-auto max-w-md bg-linear-to-t from-bg-primary via-bg-primary to-transparent px-4 pt-6 session-fixed-save-cta-pad";

/** Extra form scroll padding so the last question clears the fixed CTA. */
export const FOCUS_FORM_SCROLL_PADDING_CLASS = "session-focus-form-scroll-pad";

type FixedSaveClearanceArgs = {
  readonly showCelebration: boolean;
  readonly activeTab: string;
  readonly preCompleted: boolean;
  readonly postCompleted: boolean;
  readonly editingPre: boolean;
  readonly editingPost: boolean;
  readonly hasPreTemplate: boolean;
  readonly hasPostTemplate: boolean;
};

/**
 * True when a pre/post Focus form (with fixed Guardar) is on screen.
 */
export function shouldReserveFixedSaveClearance(
  args: FixedSaveClearanceArgs
): boolean {
  if (args.showCelebration) {
    return false;
  }

  if (args.activeTab === "pre") {
    return args.hasPreTemplate && (!args.preCompleted || args.editingPre);
  }

  if (args.activeTab === "post") {
    return args.hasPostTemplate && (!args.postCompleted || args.editingPost);
  }

  return false;
}

export function sessionPageBottomPaddingClass(
  reserveFixedSaveClearance: boolean
): string {
  return reserveFixedSaveClearance
    ? SESSION_FIXED_SAVE_CLEARANCE_CLASS
    : SESSION_DEFAULT_BOTTOM_PADDING_CLASS;
}
