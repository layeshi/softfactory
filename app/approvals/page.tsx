import React from "react";
import { revalidatePath } from "next/cache";
import { AppShell } from "@/components/layout/app-shell";
import { ApprovalList } from "@/components/approvals/approval-list";
import { ExecutionDecisionList } from "@/components/execution/execution-decision-list";
import { getRequestLocale } from "@/lib/i18n/get-locale";
import { getTranslator } from "@/lib/i18n/get-translator";
import { prisma } from "@/lib/db";
import { approveExecutionDecision, rejectExecutionDecision } from "@/lib/services/execution-decision-service";
import { resolveStatusLabel } from "@/lib/utils";

export default async function ApprovalsPage() {
  const locale = await getRequestLocale();
  const t = getTranslator(locale);
  const approvals = await prisma.approval.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });
  const executionDecisions = await prisma.executionDecision.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  async function approveDecisionAction(formData: FormData) {
    "use server";

    await approveExecutionDecision(String(formData.get("decisionId") ?? ""));
    revalidatePath("/approvals");
  }

  async function rejectDecisionAction(formData: FormData) {
    "use server";

    await rejectExecutionDecision(
      String(formData.get("decisionId") ?? ""),
      String(formData.get("comment") ?? "") || undefined,
    );
    revalidatePath("/approvals");
  }

  return (
    <AppShell
      locale={locale}
      eyebrow={t.pages.approvals.eyebrow}
      title={t.pages.approvals.title}
      description={t.pages.approvals.description}
    >
      <div className="section-span">
        <ApprovalList
          locale={locale}
          labels={{
            awaitingDecision: t.common.labels.awaitingDecision,
            approvalType: t.status.approval,
            status: t.status.approval,
          }}
          approvals={approvals}
        />
      </div>
      <div className="section-span">
        <ExecutionDecisionList
          locale={locale}
          labels={{
            decisionType: t.status.execution,
            status: t.status.execution,
            awaitingDecision: t.common.labels.awaitingDecision,
          }}
          decisions={executionDecisions}
        />
      </div>
      <div className="section-span">
        <div className="stack-list">
          {executionDecisions
            .filter((decision) => decision.status === "pending")
            .map((decision) => (
              <article key={decision.id} className="stack-card">
                <div className="stack-card-header">
                  <h3>{resolveStatusLabel(decision.decisionType, t.status.execution)}</h3>
                  <span className={`status-badge status-${decision.status}`}>
                    {resolveStatusLabel(decision.status, t.status.execution)}
                  </span>
                </div>
                <p>{decision.comment ?? t.common.labels.awaitingDecision}</p>
                <form action={approveDecisionAction} className="inline-form">
                  <input type="hidden" name="decisionId" value={decision.id} />
                  <button type="submit">{t.common.actions.approve}</button>
                </form>
                <form action={rejectDecisionAction} className="inline-form">
                  <input type="hidden" name="decisionId" value={decision.id} />
                  <input type="hidden" name="comment" value="Rejected from approvals page" />
                  <button type="submit">{t.common.actions.reject}</button>
                </form>
              </article>
            ))}
        </div>
      </div>
    </AppShell>
  );
}
