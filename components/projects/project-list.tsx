import React from "react";
import Link from "next/link";
import { formatDate, titleizeStatus } from "@/lib/utils";

type ProjectListProps = {
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

export function ProjectList({ projects }: ProjectListProps) {
  if (projects.length === 0) {
    return (
      <article className="empty-panel">
        <h3>No projects yet</h3>
        <p>Create the first project to start tracking requirements and approvals.</p>
      </article>
    );
  }

  return (
    <div className="project-list">
      {projects.map((project) => (
        <Link key={project.id} href={`/projects/${project.id}`} className="project-card">
          <div className="project-card-header">
            <div>
              <span className="metric-label">Project</span>
              <h3>{project.name}</h3>
            </div>
            <span className={`status-badge status-${project.status}`}>
              {titleizeStatus(project.status)}
            </span>
          </div>
          <p>{project.summary}</p>
          <dl>
            <div>
              <dt>Goal</dt>
              <dd>{project.goal}</dd>
            </div>
            <div>
              <dt>Requirements</dt>
              <dd>{project.requirementCount}</dd>
            </div>
            <div>
              <dt>Updated</dt>
              <dd>{formatDate(project.updatedAt)}</dd>
            </div>
          </dl>
        </Link>
      ))}
    </div>
  );
}
