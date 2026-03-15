import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { StageTimeline } from "@/components/requirements/stage-timeline";
import { getRequestLocale } from "@/lib/i18n/get-locale";
import { getTranslator } from "@/lib/i18n/get-translator";
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
    </AppShell>
  );
}
