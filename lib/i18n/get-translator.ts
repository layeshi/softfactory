import type { Locale } from "@/lib/i18n/messages";
import { messages } from "@/lib/i18n/messages";

export function getTranslator(locale: Locale) {
  return messages[locale];
}
