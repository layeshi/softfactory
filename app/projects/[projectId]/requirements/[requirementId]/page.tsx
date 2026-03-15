import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { StageTimeline } from "@/components/requirements/stage-timeline";
import { getRequirementDetail } from "@/lib/services/requirement-service";
import { titleizeStatus } from "@/lib/utils";

type RequirementDetailPageProps = {
  params: Promise<{ projectId: string; requirementId: string }>;
};

export default async function RequirementDetailPage({
  params,
}: RequirementDetailPageProps) {
  const { projectId, requirementId } = await params;
  const requirement = await getRequirementDetail(requirementId);

  if (!requirement) {
    notFound();
  }

  return (
    <AppShell
      eyebrow={titleizeStatus(requirement.status)}
      title={requirement.title}
      description={requirement.normalizedDescription}
    >
      <section className="section-span split-columns">
        <article className="stack-card">
          <span className="metric-label">Lifecycle</span>
          <h3>Engineering stages</h3>
          <StageTimeline stages={requirement.stages} />
        </article>
        <article className="stack-card">
          <span className="metric-label">Context</span>
          <h3>Original request</h3>
          <p>{requirement.originalRequest}</p>
          <p>Priority: {requirement.priority}</p>
          <p>Version: {requirement.version}</p>
          <Link href={`/projects/${projectId}`}>Back to project</Link>
        </article>
      </section>
    </AppShell>
  );
}
