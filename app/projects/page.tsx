import React from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { ProjectList } from "@/components/projects/project-list";
import { listProjects } from "@/lib/services/project-service";

export default async function ProjectsPage() {
  const projects = await listProjects();

  return (
    <AppShell
      eyebrow="Projects"
      title="Project Portfolio"
      description="Browse every software initiative, track status, and jump into detailed requirement workspaces."
    >
      <div className="section-span">
        <div className="page-toolbar">
          <div>
            <span className="metric-label">Overview</span>
            <h3>All active projects</h3>
          </div>
          <Link href="/projects/new" className="action-link">
            New project
          </Link>
        </div>
        <ProjectList projects={projects} />
      </div>
    </AppShell>
  );
}
