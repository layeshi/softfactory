import type { Locale } from "@/lib/i18n/messages";
import { SUPPORTED_LOCALES } from "@/lib/i18n/messages";
import { cookies } from "next/headers";

const DEFAULT_LOCALE: Locale = "zh";

export function resolveLocale(input?: string | null): Locale {
  if (input && SUPPORTED_LOCALES.includes(input as Locale)) {
    return input as Locale;
  }

  return DEFAULT_LOCALE;
}

export const defaultLocale = DEFAULT_LOCALE;

export async function getRequestLocale() {
  const cookieStore = await cookies();
  return resolveLocale(cookieStore.get("locale")?.value);
}
