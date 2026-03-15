"use client";

import React from "react";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Locale } from "@/lib/i18n/messages";

type LanguageSwitcherProps = {
  locale: Locale;
  labels: {
    title: string;
    zh: string;
    en: string;
  };
};

export function LanguageSwitcher({
  locale,
  labels,
}: LanguageSwitcherProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  async function setLocale(nextLocale: Locale) {
    const response = await fetch("/api/locale", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ locale: nextLocale }),
    });

    if (!response.ok) {
      return;
    }

    startTransition(() => {
      router.refresh();
    });
  }

  return (
    <div className="language-switcher" aria-label={labels.title}>
      <span className="metric-label">{labels.title}</span>
      <div className="language-switcher-buttons">
        <button
          type="button"
          onClick={() => setLocale("zh")}
          disabled={isPending || locale === "zh"}
          data-active={locale === "zh"}
        >
          {labels.zh}
        </button>
        <button
          type="button"
          onClick={() => setLocale("en")}
          disabled={isPending || locale === "en"}
          data-active={locale === "en"}
        >
          {labels.en}
        </button>
      </div>
    </div>
  );
}
