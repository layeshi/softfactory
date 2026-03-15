import React from "react";
import { AppShell } from "@/components/layout/app-shell";
import { MetricCard } from "@/components/dashboard/metric-card";
import { StatusPanel } from "@/components/dashboard/status-panel";
import { getRequestLocale } from "@/lib/i18n/get-locale";
import { getTranslator } from "@/lib/i18n/get-translator";
import { getDashboardSummary } from "@/lib/services/dashboard-service";

export default async function HomePage() {
  const locale = await getRequestLocale();
  const t = getTranslator(locale);
  const summary = await getDashboardSummary();

  return (
    <AppShell
      locale={locale}
      eyebrow={t.dashboard.eyebrow}
      title={t.dashboard.title}
      description={t.dashboard.description}
    >
      <MetricCard
        label={t.dashboard.metrics.projects.label}
        value={summary.projectCount}
        detail={t.dashboard.metrics.projects.detail}
      />
      <MetricCard
        label={t.dashboard.metrics.pendingApprovals.label}
        value={summary.pendingApprovals}
        detail={t.dashboard.metrics.pendingApprovals.detail}
      />
      <StatusPanel
        eyebrow={t.common.overview}
        title={t.dashboard.snapshot.title}
        items={[
          {
            label: t.dashboard.snapshot.inProgressProjects,
            value: String(summary.inProgressProjects),
          },
          {
            label: t.dashboard.snapshot.blockedProjects,
            value: String(summary.blockedProjects),
          },
          {
            label: t.dashboard.snapshot.recentChanges,
            value: String(summary.recentChanges.length),
          },
        ]}
      />
    </AppShell>
  );
}
