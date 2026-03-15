import React from "react";
import type { Locale } from "@/lib/i18n/messages";
import { formatDate, resolveStatusLabel } from "@/lib/utils";

type ApprovalListProps = {
  locale: Locale;
  labels: {
    awaitingDecision: string;
    approvalType: Record<string, string>;
    status: Record<string, string>;
  };
  approvals: Array<{
    id: string;
    approvalType: string;
    status: string;
    createdAt: string | Date;
    comment: string | null;
  }>;
};

export function ApprovalList({ locale, labels, approvals }: ApprovalListProps) {
  return (
    <div className="stack-list">
      {approvals.map((approval) => (
        <article key={approval.id} className="stack-card">
          <div className="stack-card-header">
            <h3>{resolveStatusLabel(approval.approvalType, labels.approvalType)}</h3>
            <span className={`status-badge status-${approval.status}`}>
              {resolveStatusLabel(approval.status, labels.status)}
            </span>
          </div>
          <p>{approval.comment ?? labels.awaitingDecision}</p>
          <small>{formatDate(approval.createdAt, locale)}</small>
        </article>
      ))}
    </div>
  );
}
