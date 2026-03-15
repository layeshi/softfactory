import React from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { ProjectList } from "@/components/projects/project-list";
import { getRequestLocale } from "@/lib/i18n/get-locale";
import { getTranslator } from "@/lib/i18n/get-translator";
import { listProjects } from "@/lib/services/project-service";

export default async function ProjectsPage() {
  const locale = await getRequestLocale();
  const t = getTranslator(locale);
  const projects = await listProjects();

  return (
    <AppShell
      locale={locale}
      eyebrow={t.pages.projects.eyebrow}
      title={t.pages.projects.title}
      description={t.pages.projects.description}
    >
      <div className="section-span">
        <div className="page-toolbar">
          <div>
            <span className="metric-label">{t.common.overview}</span>
            <h3>{t.pages.projects.sectionTitle}</h3>
          </div>
          <Link href="/projects/new" className="action-link">
            {t.common.actions.newProject}
          </Link>
        </div>
        <ProjectList
          locale={locale}
          labels={{
            emptyTitle: t.common.empty.noProjectsTitle,
            emptyDescription: t.common.empty.noProjectsDescription,
            project: t.common.labels.project,
            goal: t.common.fields.goal,
            requirements: t.common.fields.requirements,
            updated: t.common.fields.updated,
          }}
          statusLabels={t.status.project}
          projects={projects}
        />
      </div>
    </AppShell>
  );
}
