import React from "react";
import type { Locale } from "@/lib/i18n/messages";
import { formatDate, resolveStatusLabel } from "@/lib/utils";

type DocumentListProps = {
  locale: Locale;
  typeLabels: Record<string, string>;
  documents: Array<{
    id: string;
    title: string;
    documentType: string;
    generatedAt: string | Date;
    filePath: string;
  }>;
};

export function DocumentList({ locale, typeLabels, documents }: DocumentListProps) {
  return (
    <div className="stack-list">
      {documents.map((document) => (
        <article key={document.id} className="stack-card">
          <div className="stack-card-header">
            <h3>{document.title}</h3>
            <span className="status-badge">
              {resolveStatusLabel(document.documentType, typeLabels)}
            </span>
          </div>
          <p>{document.filePath}</p>
          <small>{formatDate(document.generatedAt, locale)}</small>
        </article>
      ))}
    </div>
  );
}
