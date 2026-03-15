import type { Locale } from "@/lib/i18n/messages";

export function formatDate(input: string | Date, locale: Locale = "zh") {
  const date = typeof input === "string" ? new Date(input) : input;
  const language = locale === "zh" ? "zh-CN" : "en-US";

  return new Intl.DateTimeFormat(language, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function titleizeStatus(value: string) {
  return value.replace(/_/g, " ");
}

export function resolveStatusLabel(
  value: string,
  dictionary: Record<string, string>,
) {
  return dictionary[value] ?? titleizeStatus(value);
}
