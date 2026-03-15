import React from "react";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { ExecutionDecisionList } from "@/components/execution/execution-decision-list";
import { RunDetailPanel } from "@/components/execution/run-detail-panel";
import { getRequestLocale } from "@/lib/i18n/get-locale";
import { getTranslator } from "@/lib/i18n/get-translator";
import { getExecutionRunDetail } from "@/lib/services/execution-service";

type RunDetailPageProps = {
  params: Promise<{ runId: string }>;
};

export default async function RunDetailPage({ params }: RunDetailPageProps) {
  const locale = await getRequestLocale();
  const t = getTranslator(locale);
  const { runId } = await params;
  const run = await getExecutionRunDetail(runId);

  if (!run) {
    notFound();
  }

  return (
    <AppShell
      locale={locale}
      eyebrow={t.pages.runDetail.eyebrow}
      title={t.pages.runDetail.title}
      description={t.pages.runDetail.description}
    >
      <section className="section-span split-columns">
        <RunDetailPanel
          labels={{
            summary: t.pages.runDetail.summary,
            artifacts: t.pages.runDetail.artifacts,
            decisions: t.pages.runDetail.decisions,
            runType: t.status.execution,
            status: t.status.execution,
            stage: t.status.stage,
            logs: t.common.fields.status,
            result: t.common.overview,
            executionMode: t.status.execution,
            taskPackage: t.common.fields.taskPackage,
            worktree: t.common.fields.worktree,
            requirementTitle: t.common.fields.title,
          }}
          run={run}
        />
        <article className="stack-card">
          <span className="metric-label">{t.pages.runDetail.decisions}</span>
          <ExecutionDecisionList
            locale={locale}
            labels={{
              decisionType: t.status.execution,
              status: t.status.execution,
              awaitingDecision: t.common.labels.awaitingDecision,
            }}
            decisions={run.decisions}
          />
        </article>
      </section>
    </AppShell>
  );
}
