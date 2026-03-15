import React from "react";
import { defaultLocale } from "@/lib/i18n/get-locale";
import { getTranslator } from "@/lib/i18n/get-translator";
import type { Locale } from "@/lib/i18n/messages";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { SidebarNav } from "@/components/layout/sidebar-nav";

type AppShellProps = {
  title: string;
  eyebrow: string;
  description: string;
  children: React.ReactNode;
  locale?: Locale;
};

export function AppShell({
  title,
  eyebrow,
  description,
  children,
  locale = defaultLocale,
}: AppShellProps) {
  const t = getTranslator(locale);

  return (
    <div className="app-frame">
      <SidebarNav
        labels={{
          brandKicker: t.layout.brandKicker,
          brandTitle: t.layout.brandTitle,
          brandDescription: t.layout.brandDescription,
          nav: t.layout.nav,
        }}
      />
      <main className="app-main">
        <header className="hero-panel">
          <div className="hero-topbar">
            <span className="hero-eyebrow">{eyebrow}</span>
            <LanguageSwitcher
              locale={locale}
              labels={{
                title: t.layout.language.label,
                zh: t.layout.language.zh,
                en: t.layout.language.en,
              }}
            />
          </div>
          <h2>{title}</h2>
          <p>{description}</p>
        </header>
        <section className="content-grid">{children}</section>
      </main>
    </div>
  );
}
