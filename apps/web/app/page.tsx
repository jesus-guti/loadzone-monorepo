import { redirect } from "next/navigation";
import { locales } from "@repo/internationalization";

/**
 * Root page: redirects to the default locale so the home page is served.
 * All actual routes live under [locale] (e.g. /en, /es).
 */
export default function RootPage() {
  const defaultLocale = locales[0];
  redirect(`/${defaultLocale}`);
}
