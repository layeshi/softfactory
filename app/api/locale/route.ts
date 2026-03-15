import { NextResponse } from "next/server";
import { resolveLocale } from "@/lib/i18n/get-locale";
import { SUPPORTED_LOCALES } from "@/lib/i18n/messages";

export async function POST(request: Request) {
  const body = (await request.json()) as { locale?: string };

  if (!body.locale || !SUPPORTED_LOCALES.includes(body.locale as "zh" | "en")) {
    return NextResponse.json({ error: "Invalid locale" }, { status: 400 });
  }

  const locale = resolveLocale(body.locale);
  const response = NextResponse.json({ locale });

  response.cookies.set("locale", locale, {
    path: "/",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
  });

  return response;
}
