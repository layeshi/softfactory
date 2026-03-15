import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { revalidatePath } from "next/cache";
import { AppShell } from "@/components/layout/app-shell";
import { ExecutionDecisionList } from "@/components/execution/execution-decision-list";
import { RunHistoryList } from "@/components/execution/run-history-list";
import { RunLaunchForm } from "@/components/execution/run-launch-form";
import { StageTimeline } from "@/components/requirements/stage-timeline";
import { prisma } from "@/lib/db";
import { getRequestLocale } from "@/lib/i18n/get-locale";
import { getTranslator } from "@/lib/i18n/get-translator";
import { approveExecutionDecision, rejectExecutionDecision } from "@/lib/services/execution-decision-service";
import { createExecutionRun, listExecutionRunsByRequirement } from "@/lib/services/execution-service";
import { getRequirementDetail } from "@/lib/services/requirement-service";
import { resolveStatusLabel } from "@/lib/utils";

type RequirementDetailPageProps = {
  params: Promise<{ projectId: string; requirementId: string }>;
};

export default async function RequirementDetailPage({
  params,
}: RequirementDetailPageProps) {
  const locale = await getRequestLocale();
  const t = getTranslator(locale);
  const { projectId, requirementId } = await params;
  const requirement = await getRequirementDetail(requirementId);

  if (!requirement) {
    notFound();
  }

  const runs = await listExecutionRunsByRequirement(requirement.id);
  const executionDecisions = await prisma.executionDecision.findMany({
    where: {
      executionRun: {
        requirementId,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  async function createRunAction(formData: FormData) {
    "use server";

    const runType = String(formData.get("runType") ?? "full_run") as
      | "full_run"
      | "stage_run";
    const targetStageValue = String(formData.get("targetStage") ?? "");
    const targetStage =
      runType === "stage_run" &&
      (targetStageValue === "design" ||
        targetStageValue === "development" ||
        targetStageValue === "test")
        ? targetStageValue
        : undefined;

    await createExecutionRun({
      requirementId,
      runType,
      executionMode: String(formData.get("executionMode") ?? "manual_gate") as
        | "manual_gate"
        | "auto_flow",
      targetStage,
    });

    revalidatePath(`/projects/${projectId}/requirements/${requirementId}`);
    revalidatePath(`/projects/${projectId}`);
  }

  async function approveDecisionAction(formData: FormData) {
    "use server";

    await approveExecutionDecision(String(formData.get("decisionId") ?? ""));
    revalidatePath(`/projects/${projectId}/requirements/${requirementId}`);
    revalidatePath("/approvals");
  }

  async function rejectDecisionAction(formData: FormData) {
    "use server";

    await rejectExecutionDecision(
      String(formData.get("decisionId") ?? ""),
      String(formData.get("comment") ?? "") || undefined,
    );
    revalidatePath(`/projects/${projectId}/requirements/${requirementId}`);
    revalidatePath("/approvals");
  }

  return (
    <AppShell
      locale={locale}
      eyebrow={resolveStatusLabel(requirement.status, t.status.requirement)}
      title={requirement.title}
      description={requirement.normalizedDescription}
    >
      <section className="section-span split-columns">
        <article className="stack-card">
          <span className="metric-label">{t.pages.requirementDetail.lifecycle}</span>
          <h3>{t.pages.requirementDetail.engineeringStages}</h3>
          <StageTimeline
            labels={{
              stage: t.status.stage,
              status: t.status.stage,
            }}
            stages={requirement.stages}
          />
        </article>
        <article className="stack-card">
          <span className="metric-label">{t.pages.requirementDetail.context}</span>
          <h3>{t.pages.requirementDetail.originalRequest}</h3>
          <p>{requirement.originalRequest}</p>
          <p>
            {t.common.fields.priority}:{" "}
            {resolveStatusLabel(requirement.priority, t.common.values)}
          </p>
          <p>
            {t.pages.requirementDetail.version}: {requirement.version}
          </p>
          <Link href={`/projects/${projectId}`}>{t.common.actions.backToProject}</Link>
        </article>
      </section>

      <section className="section-span split-columns">
        <article className="stack-card">
          <span className="metric-label">{t.pages.requirementDetail.execution}</span>
          <h3>{t.pages.requirementDetail.executionDescription}</h3>
          <RunLaunchForm
            action={createRunAction}
            labels={{
              runType: t.common.fields.runType,
              executionMode: t.common.fields.executionMode,
              targetStage: t.common.fields.targetStage,
              submit: t.common.actions.startRun,
              runTypes: {
                full_run: t.status.execution.full_run,
                stage_run: t.status.execution.stage_run,
              },
              executionModes: {
                manual_gate: t.status.execution.manual_gate,
                auto_flow: t.status.execution.auto_flow,
              },
              stages: {
                design: t.status.stage.design,
                development: t.status.stage.development,
                test: t.status.stage.test,
              },
            }}
          />
        </article>
        <article className="stack-card">
          <span className="metric-label">{t.pages.requirementDetail.runHistory}</span>
          <RunHistoryList
            labels={{
              runType: t.status.execution,
              status: t.status.execution,
              openRun: t.common.actions.openRun,
            }}
            runs={runs}
          />
        </article>
      </section>

      <section className="section-span split-columns">
        <article className="stack-card">
          <span className="metric-label">{t.pages.runDetail.decisions}</span>
          <ExecutionDecisionList
            locale={locale}
            labels={{
              decisionType: t.status.execution,
              status: t.status.execution,
              awaitingDecision: t.common.labels.awaitingDecision,
            }}
            decisions={executionDecisions}
          />
        </article>
        <article className="stack-card">
          <span className="metric-label">{t.common.actions.approve}</span>
          <div className="stack-list">
            {executionDecisions
              .filter((decision) => decision.status === "pending")
              .map((decision) => (
                <article key={decision.id} className="stack-card">
                  <p>{resolveStatusLabel(decision.decisionType, t.status.execution)}</p>
                  <form action={approveDecisionAction} className="inline-form">
                    <input type="hidden" name="decisionId" value={decision.id} />
                    <button type="submit">{t.common.actions.approve}</button>
                  </form>
                  <form action={rejectDecisionAction} className="inline-form">
                    <input type="hidden" name="decisionId" value={decision.id} />
                    <input type="hidden" name="comment" value="Rejected from requirement detail" />
                    <button type="submit">{t.common.actions.reject}</button>
                  </form>
                </article>
              ))}
          </div>
        </article>
      </section>
    </AppShell>
  );
}
