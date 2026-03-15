import React from "react";
import { formatDate, titleizeStatus } from "@/lib/utils";

type DocumentListProps = {
  documents: Array<{
    id: string;
    title: string;
    documentType: string;
    generatedAt: string | Date;
    filePath: string;
  }>;
};

export function DocumentList({ documents }: DocumentListProps) {
  return (
    <div className="stack-list">
      {documents.map((document) => (
        <article key={document.id} className="stack-card">
          <div className="stack-card-header">
            <h3>{document.title}</h3>
            <span className="status-badge">{titleizeStatus(document.documentType)}</span>
          </div>
          <p>{document.filePath}</p>
          <small>{formatDate(document.generatedAt)}</small>
        </article>
      ))}
    </div>
  );
}
