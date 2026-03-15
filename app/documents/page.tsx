import React from "react";
import { AppShell } from "@/components/layout/app-shell";
import { DocumentList } from "@/components/documents/document-list";
import { getRequestLocale } from "@/lib/i18n/get-locale";
import { getTranslator } from "@/lib/i18n/get-translator";
import { prisma } from "@/lib/db";

export default async function DocumentsPage() {
  const locale = await getRequestLocale();
  const t = getTranslator(locale);
  const documents = await prisma.document.findMany({
    orderBy: {
      generatedAt: "desc",
    },
  });

  return (
    <AppShell
      locale={locale}
      eyebrow={t.pages.documents.eyebrow}
      title={t.pages.documents.title}
      description={t.pages.documents.description}
    >
      <div className="section-span">
        <DocumentList locale={locale} typeLabels={t.status.stage} documents={documents} />
      </div>
    </AppShell>
  );
}
