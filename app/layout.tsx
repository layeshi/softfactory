import type { Metadata } from "next";
import "./globals.css";
import React from "react";
import { getRequestLocale } from "@/lib/i18n/get-locale";

export const metadata: Metadata = {
  title: "Software Factory",
  description: "Local software factory console",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const locale = await getRequestLocale();

  return (
    <html lang={locale}>
      <body>{children}</body>
    </html>
  );
}
