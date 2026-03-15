import React from "react";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { ProjectForm } from "@/components/projects/project-form";
import { createProject } from "@/lib/services/project-service";

export default function NewProjectPage() {
  async function createProjectAction(formData: FormData) {
    "use server";

    const project = await createProject({
      name: String(formData.get("name") ?? ""),
      summary: String(formData.get("summary") ?? ""),
      goal: String(formData.get("goal") ?? ""),
    });

    revalidatePath("/");
    revalidatePath("/projects");
    redirect(`/projects/${project.id}`);
  }

  return (
    <AppShell
      eyebrow="Create"
      title="New Project"
      description="Start a local software initiative with a clear summary, goal, and room for structured requirements."
    >
      <div className="section-span">
        <ProjectForm action={createProjectAction} />
      </div>
    </AppShell>
  );
}
