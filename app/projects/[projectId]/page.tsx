import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { revalidatePath } from "next/cache";
import { AppShell } from "@/components/layout/app-shell";
import { ApprovalList } from "@/components/approvals/approval-list";
import { ChangeRequestForm } from "@/components/change-requests/change-request-form";
import { DocumentList } from "@/components/documents/document-list";
import { RunHistoryList } from "@/components/execution/run-history-list";
import { RequirementForm } from "@/components/requirements/requirement-form";
import { StageTimeline } from "@/components/requirements/stage-timeline";
import { getRequestLocale } from "@/lib/i18n/get-locale";
import { getTranslator } from "@/lib/i18n/get-translator";
import { createChangeRequest } from "@/lib/services/change-request-service";
import { generateRequirementDocument } from "@/lib/services/document-service";
import { getProjectDetail } from "@/lib/services/project-service";
import { createRequirement } from "@/lib/services/requirement-service";
import { formatDate, resolveStatusLabel } from "@/lib/utils";

type ProjectDetailPageProps = {
  params: Promise<{ projectId: string }>;
};

export default async function ProjectDetailPage({
  params,
}: ProjectDetailPageProps) {
  const locale = await getRequestLocale();
  const t = getTranslator(locale);
  const { projectId } = await params;
  const project = await getProjectDetail(projectId);

  if (!project) {
    notFound();
  }

  const activeProject = project;

  async function createRequirementAction(formData: FormData) {
    "use server";

    await createRequirement({
      projectId: activeProject.id,
      title: String(formData.get("title") ?? ""),
      originalRequest: String(formData.get("originalRequest") ?? ""),
      normalizedDescription: String(formData.get("normalizedDescription") ?? ""),
      priority: String(formData.get("priority") ?? "medium"),
    });

    revalidatePath(`/projects/${activeProject.id}`);
  }

  async function createChangeRequestAction(formData: FormData) {
    "use server";

    await createChangeRequest({
      projectId: activeProject.id,
      targetRequirementId:
        String(formData.get("targetRequirementId") ?? "") || undefined,
      changeType: String(formData.get("changeType") ?? "modify") as
        | "modify"
        | "add"
        | "delete",
      proposedTitle: String(formData.get("proposedTitle") ?? "") || undefined,
      proposedContent: String(formData.get("proposedContent") ?? "") || undefined,
      reason: String(formData.get("reason") ?? ""),
      impactSummary: String(formData.get("impactSummary") ?? ""),
    });

    revalidatePath(`/projects/${activeProject.id}`);
    revalidatePath("/approvals");
  }

  async function generateDocumentAction(formData: FormData) {
    "use server";

    const requirementId = String(formData.get("requirementId") ?? "");
    const requirement = activeProject.requirements.find(
      (item) => item.id === requirementId,
    );

    if (!requirement) {
      return;
    }

    await generateRequirementDocument({
      project: activeProject,
      requirement,
    });

    revalidatePath(`/projects/${activeProject.id}`);
    revalidatePath("/documents");
  }

  return (
    <AppShell
      locale={locale}
      eyebrow={resolveStatusLabel(activeProject.status, t.status.project)}
      title={activeProject.name}
      description={activeProject.summary}
    >
      <section className="section-span detail-grid">
        <article className="stack-card">
          <span className="metric-label">{t.pages.projectDetail.goal}</span>
          <h3>{activeProject.goal}</h3>
          <p>
            {t.common.fields.updated} {formatDate(activeProject.updatedAt, locale)}
          </p>
        </article>
        <article className="stack-card">
          <span className="metric-label">{t.pages.projectDetail.quickFacts}</span>
          <dl className="facts-grid">
            <div>
              <dt>{t.common.fields.status}</dt>
              <dd>{resolveStatusLabel(activeProject.status, t.status.project)}</dd>
            </div>
            <div>
              <dt>{t.common.fields.requirements}</dt>
              <dd>{activeProject.requirements.length}</dd>
            </div>
            <div>
              <dt>{t.pages.projectDetail.pendingApprovals}</dt>
              <dd>
                {
                  activeProject.approvals.filter(
                    (item) => item.status === "pending",
                  ).length
                }
              </dd>
            </div>
          </dl>
        </article>
      </section>

      <section className="section-span split-columns">
        <article className="stack-card">
          <div className="page-toolbar">
            <div>
              <span className="metric-label">{t.common.fields.requirements}</span>
              <h3>{t.pages.projectDetail.requirementBacklog}</h3>
            </div>
          </div>
          <div className="stack-list">
            {activeProject.requirements.map((requirement) => (
              <article key={requirement.id} className="stack-card">
                <div className="stack-card-header">
                  <div>
                    <h3>{requirement.title}</h3>
                    <p>
                      {resolveStatusLabel(requirement.priority, t.common.values)}{" "}
                      {t.common.labels.prioritySuffix}
                    </p>
                  </div>
                  <Link
                    href={`/projects/${activeProject.id}/requirements/${requirement.id}`}
                  >
                    {t.common.actions.open}
                  </Link>
                </div>
                <StageTimeline
                  labels={{
                    stage: t.status.stage,
                    status: t.status.stage,
                  }}
                  stages={requirement.stages}
                />
                <form action={generateDocumentAction} className="inline-form">
                  <input type="hidden" name="requirementId" value={requirement.id} />
                  <button type="submit">{t.common.actions.generateRequirementDoc}</button>
                </form>
              </article>
            ))}
          </div>
        </article>

        <div className="stack-list">
          <article className="stack-card">
            <span className="metric-label">{t.pages.projectDetail.addRequirement}</span>
            <RequirementForm
              action={createRequirementAction}
              labels={{
                title: t.common.fields.title,
                originalRequest: t.common.fields.originalRequest,
                normalizedDescription: t.common.fields.normalizedDescription,
                priority: t.common.fields.priority,
                priorities: t.common.values,
                submit: t.common.actions.addRequirement,
              }}
            />
          </article>
          <article className="stack-card">
            <span className="metric-label">{t.pages.projectDetail.changeManagement}</span>
            <ChangeRequestForm
              action={createChangeRequestAction}
              labels={{
                changeType: t.common.fields.changeType,
                targetRequirement: t.common.fields.targetRequirement,
                proposedTitle: t.common.fields.proposedTitle,
                proposedContent: t.common.fields.proposedContent,
                reason: t.common.fields.reason,
                impactSummary: t.common.fields.impactSummary,
                noTarget: t.common.values.noTarget,
                modifyExisting: t.changeRequest.modifyExisting,
                addNew: t.changeRequest.addNew,
                deleteExisting: t.changeRequest.deleteExisting,
                submit: t.common.actions.submitChangeRequest,
              }}
              requirementOptions={activeProject.requirements.map((requirement) => ({
                id: requirement.id,
                title: requirement.title,
              }))}
            />
          </article>
        </div>
      </section>

      <section className="section-span split-columns">
        <article className="stack-card">
          <span className="metric-label">{t.pages.projectDetail.approvals}</span>
          <h3>{t.pages.projectDetail.approvalsDescription}</h3>
          <ApprovalList
            locale={locale}
            labels={{
              awaitingDecision: t.common.labels.awaitingDecision,
              approvalType: t.status.approval,
              status: t.status.approval,
            }}
            approvals={activeProject.approvals}
          />
        </article>
        <article className="stack-card">
          <span className="metric-label">{t.pages.projectDetail.documents}</span>
          <h3>{t.pages.projectDetail.documentsDescription}</h3>
          <DocumentList
            locale={locale}
            typeLabels={t.status.stage}
            documents={activeProject.documents}
          />
        </article>
      </section>

      <section className="section-span">
        <article className="stack-card">
          <span className="metric-label">{t.pages.projectDetail.recentRuns}</span>
          <h3>{t.pages.projectDetail.recentRunsDescription}</h3>
          <RunHistoryList
            labels={{
              runType: t.status.execution,
              status: t.status.execution,
              openRun: t.common.actions.openRun,
            }}
            runs={activeProject.executionRuns}
          />
        </article>
      </section>
    </AppShell>
  );
}
