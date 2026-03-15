import React from "react";
import { AppShell } from "@/components/layout/app-shell";
import { MetricCard } from "@/components/dashboard/metric-card";
import { StatusPanel } from "@/components/dashboard/status-panel";
import { getDashboardSummary } from "@/lib/services/dashboard-service";

export default async function HomePage() {
  const summary = await getDashboardSummary();

  return (
    <AppShell
      eyebrow="Phase One"
      title="Software Factory"
      description="Operate projects, requirements, approvals, and generated documents from one local command center."
    >
      <MetricCard
        label="Projects"
        value={summary.projectCount}
        detail="Active delivery streams tracked in the local factory."
      />
      <MetricCard
        label="Pending approvals"
        value={summary.pendingApprovals}
        detail="Human confirmation gates waiting for a decision."
      />
      <StatusPanel
        title="Operational snapshot"
        items={[
          { label: "In-progress projects", value: String(summary.inProgressProjects) },
          { label: "Blocked projects", value: String(summary.blockedProjects) },
          { label: "Recent changes", value: String(summary.recentChanges.length) },
        ]}
      />
    </AppShell>
  );
}
