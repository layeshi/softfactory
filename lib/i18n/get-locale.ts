import type { Locale } from "@/lib/i18n/messages";
import { SUPPORTED_LOCALES } from "@/lib/i18n/messages";

const DEFAULT_LOCALE: Locale = "zh";

export function resolveLocale(input?: string | null): Locale {
  if (input && SUPPORTED_LOCALES.includes(input as Locale)) {
    return input as Locale;
  }

  return DEFAULT_LOCALE;
}

export const defaultLocale = DEFAULT_LOCALE;
