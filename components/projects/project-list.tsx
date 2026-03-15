import React from "react";
import Link from "next/link";
import type { Locale } from "@/lib/i18n/messages";
import { formatDate, resolveStatusLabel } from "@/lib/utils";

type ProjectListProps = {
  locale: Locale;
  labels: {
    emptyTitle: string;
    emptyDescription: string;
    project: string;
    goal: string;
    requirements: string;
    updated: string;
  };
  statusLabels: Record<string, string>;
  projects: Array<{
    id: string;
    name: string;
    slug: string;
    summary: string;
    goal: string;
    status: string;
    requirementCount: number;
    updatedAt: string | Date;
  }>;
};

export function ProjectList({
  locale,
  labels,
  statusLabels,
  projects,
}: ProjectListProps) {
  if (projects.length === 0) {
    return (
      <article className="empty-panel">
        <h3>{labels.emptyTitle}</h3>
        <p>{labels.emptyDescription}</p>
      </article>
    );
  }

  return (
    <div className="project-list">
      {projects.map((project) => (
        <Link key={project.id} href={`/projects/${project.id}`} className="project-card">
          <div className="project-card-header">
            <div>
              <span className="metric-label">{labels.project}</span>
              <h3>{project.name}</h3>
            </div>
            <span className={`status-badge status-${project.status}`}>
              {resolveStatusLabel(project.status, statusLabels)}
            </span>
          </div>
          <p>{project.summary}</p>
          <dl>
            <div>
              <dt>{labels.goal}</dt>
              <dd>{project.goal}</dd>
            </div>
            <div>
              <dt>{labels.requirements}</dt>
              <dd>{project.requirementCount}</dd>
            </div>
            <div>
              <dt>{labels.updated}</dt>
              <dd>{formatDate(project.updatedAt, locale)}</dd>
            </div>
          </dl>
        </Link>
      ))}
    </div>
  );
}
