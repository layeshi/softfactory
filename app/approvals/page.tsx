import React from "react";
import { AppShell } from "@/components/layout/app-shell";
import { ApprovalList } from "@/components/approvals/approval-list";
import { prisma } from "@/lib/db";

export default async function ApprovalsPage() {
  const approvals = await prisma.approval.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <AppShell
      eyebrow="Control"
      title="Approvals"
      description="Track confirmation gates for requirements, design, tests, and change requests."
    >
      <div className="section-span">
        <ApprovalList approvals={approvals} />
      </div>
    </AppShell>
  );
}
