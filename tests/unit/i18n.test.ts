import { getTranslator } from "@/lib/i18n/get-translator";
import { resolveLocale } from "@/lib/i18n/get-locale";

test("defaults to zh when locale is missing", () => {
  expect(resolveLocale(undefined)).toBe("zh");
});

test("returns English labels when locale is en", () => {
  const t = getTranslator("en");
  expect(t.layout.nav.projects).toBe("Projects");
});
