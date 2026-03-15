import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { Project, Requirement } from "@prisma/client";
import { prisma } from "@/lib/db";
import { logActivity } from "@/lib/services/activity-service";
import { ensureProjectDirectories } from "@/lib/services/workspace-service";

type GenerateRequirementDocumentInput = {
  project: Project;
  requirement: Requirement;
};

function toSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function generateRequirementDocument({
  project,
  requirement,
}: GenerateRequirementDocumentInput) {
  const directories = await ensureProjectDirectories(project.slug);
  const filePath = join(
    directories.requirementDir,
    `${toSlug(requirement.title)}-v${requirement.version}.md`,
  );

  const content = `# ${requirement.title}

## Project

- Name: ${project.name}
- Goal: ${project.goal}

## Original Request

${requirement.originalRequest}

## Normalized Requirement

${requirement.normalizedDescription}

## Priority

${requirement.priority}
`;

  await writeFile(filePath, content, "utf8");

  const document = await prisma.document.create({
    data: {
      projectId: project.id,
      requirementId: requirement.id,
      documentType: "requirement",
      title: `${requirement.title} Requirement`,
      filePath,
      version: requirement.version,
    },
  });

  await logActivity({
    projectId: project.id,
    requirementId: requirement.id,
    actionType: "document.generated",
    message: `Requirement document generated for ${requirement.title}.`,
  });

  return document;
}
