import React from "react";
import { formatDate, titleizeStatus } from "@/lib/utils";

type ApprovalListProps = {
  approvals: Array<{
    id: string;
    approvalType: string;
    status: string;
    createdAt: string | Date;
    comment: string | null;
  }>;
};

export function ApprovalList({ approvals }: ApprovalListProps) {
  return (
    <div className="stack-list">
      {approvals.map((approval) => (
        <article key={approval.id} className="stack-card">
          <div className="stack-card-header">
            <h3>{titleizeStatus(approval.approvalType)}</h3>
            <span className={`status-badge status-${approval.status}`}>
              {titleizeStatus(approval.status)}
            </span>
          </div>
          <p>{approval.comment ?? "Awaiting operator decision."}</p>
          <small>{formatDate(approval.createdAt)}</small>
        </article>
      ))}
    </div>
  );
}
