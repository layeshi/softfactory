import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { revalidatePath } from "next/cache";
import { AppShell } from "@/components/layout/app-shell";
import { ApprovalList } from "@/components/approvals/approval-list";
import { ChangeRequestForm } from "@/components/change-requests/change-request-form";
import { DocumentList } from "@/components/documents/document-list";
import { RequirementForm } from "@/components/requirements/requirement-form";
import { StageTimeline } from "@/components/requirements/stage-timeline";
import { createChangeRequest } from "@/lib/services/change-request-service";
import { generateRequirementDocument } from "@/lib/services/document-service";
import { getProjectDetail } from "@/lib/services/project-service";
import { createRequirement } from "@/lib/services/requirement-service";
import { formatDate, titleizeStatus } from "@/lib/utils";

type ProjectDetailPageProps = {
  params: Promise<{ projectId: string }>;
};

export default async function ProjectDetailPage({
  params,
}: ProjectDetailPageProps) {
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
      eyebrow={titleizeStatus(activeProject.status)}
      title={activeProject.name}
      description={activeProject.summary}
    >
      <section className="section-span detail-grid">
        <article className="stack-card">
          <span className="metric-label">Goal</span>
          <h3>{activeProject.goal}</h3>
          <p>Updated {formatDate(activeProject.updatedAt)}</p>
        </article>
        <article className="stack-card">
          <span className="metric-label">Quick facts</span>
          <dl className="facts-grid">
            <div>
              <dt>Status</dt>
              <dd>{titleizeStatus(activeProject.status)}</dd>
            </div>
            <div>
              <dt>Requirements</dt>
              <dd>{activeProject.requirements.length}</dd>
            </div>
            <div>
              <dt>Pending approvals</dt>
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
              <span className="metric-label">Requirements</span>
              <h3>Requirement backlog</h3>
            </div>
          </div>
          <div className="stack-list">
            {activeProject.requirements.map((requirement) => (
              <article key={requirement.id} className="stack-card">
                <div className="stack-card-header">
                  <div>
                    <h3>{requirement.title}</h3>
                    <p>{requirement.priority} priority</p>
                  </div>
                  <Link
                    href={`/projects/${activeProject.id}/requirements/${requirement.id}`}
                  >
                    Open
                  </Link>
                </div>
                <StageTimeline stages={requirement.stages} />
                <form action={generateDocumentAction} className="inline-form">
                  <input type="hidden" name="requirementId" value={requirement.id} />
                  <button type="submit">Generate requirement doc</button>
                </form>
              </article>
            ))}
          </div>
        </article>

        <div className="stack-list">
          <article className="stack-card">
            <span className="metric-label">Add requirement</span>
            <RequirementForm action={createRequirementAction} />
          </article>
          <article className="stack-card">
            <span className="metric-label">Change management</span>
            <ChangeRequestForm
              action={createChangeRequestAction}
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
          <span className="metric-label">Approvals</span>
          <h3>Pending and recent decisions</h3>
          <ApprovalList approvals={activeProject.approvals} />
        </article>
        <article className="stack-card">
          <span className="metric-label">Documents</span>
          <h3>Generated artifacts</h3>
          <DocumentList documents={activeProject.documents} />
        </article>
      </section>
    </AppShell>
  );
}
