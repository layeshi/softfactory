import React from "react";
import { AppShell } from "@/components/layout/app-shell";
import { ApprovalList } from "@/components/approvals/approval-list";
import { getRequestLocale } from "@/lib/i18n/get-locale";
import { getTranslator } from "@/lib/i18n/get-translator";
import { prisma } from "@/lib/db";

export default async function ApprovalsPage() {
  const locale = await getRequestLocale();
  const t = getTranslator(locale);
  const approvals = await prisma.approval.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

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
    </AppShell>
  );
}
