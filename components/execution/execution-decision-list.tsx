import React from "react";
import { formatDate, resolveStatusLabel } from "@/lib/utils";
import type { Locale } from "@/lib/i18n/messages";

type ExecutionDecisionListProps = {
  locale: Locale;
  labels: {
    decisionType: Record<string, string>;
    status: Record<string, string>;
    awaitingDecision: string;
  };
  decisions: Array<{
    id: string;
    decisionType: string;
    status: string;
    comment: string | null;
    createdAt: string | Date;
  }>;
};

export function ExecutionDecisionList({
  locale,
  labels,
  decisions,
}: ExecutionDecisionListProps) {
  return (
    <div className="stack-list">
      {decisions.map((decision) => (
        <article key={decision.id} className="stack-card">
          <div className="stack-card-header">
            <h3>{resolveStatusLabel(decision.decisionType, labels.decisionType)}</h3>
            <span className={`status-badge status-${decision.status}`}>
              {resolveStatusLabel(decision.status, labels.status)}
            </span>
          </div>
          <p>{decision.comment ?? labels.awaitingDecision}</p>
          <small>{formatDate(decision.createdAt, locale)}</small>
        </article>
      ))}
    </div>
  );
}
