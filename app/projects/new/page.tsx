import React from "react";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { ProjectForm } from "@/components/projects/project-form";
import { getRequestLocale } from "@/lib/i18n/get-locale";
import { getTranslator } from "@/lib/i18n/get-translator";
import { createProject } from "@/lib/services/project-service";

export default async function NewProjectPage() {
  const locale = await getRequestLocale();
  const t = getTranslator(locale);

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
      locale={locale}
      eyebrow={t.pages.newProject.eyebrow}
      title={t.pages.newProject.title}
      description={t.pages.newProject.description}
    >
      <div className="section-span">
        <ProjectForm
          action={createProjectAction}
          labels={{
            name: t.common.fields.name,
            summary: t.common.fields.summary,
            goal: t.common.fields.goal,
            submit: t.common.actions.createProject,
          }}
        />
      </div>
    </AppShell>
  );
}
