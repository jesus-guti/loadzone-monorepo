/** Super Admin with no operating Club may only stay on platform settings. */
export function shouldRedirectOperatorToPlatform(
  pathname: string,
  hasOperatingClub: boolean
): boolean {
  if (hasOperatingClub) {
    return false;
  }
  return pathname !== "/settings/platform" && !pathname.startsWith("/settings/platform/");
}
