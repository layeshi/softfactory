import { beforeEach, expect, test } from "vitest";
import { rm, stat } from "node:fs/promises";
import { prisma } from "@/lib/db";
import { generateRequirementDocument } from "@/lib/services/document-service";
import { createProject } from "@/lib/services/project-service";
import { createRequirement } from "@/lib/services/requirement-service";

beforeEach(async () => {
  await prisma.executionDecision.deleteMany();
  await prisma.executionArtifact.deleteMany();
  await prisma.executionStageRun.deleteMany();
  await prisma.executionRun.deleteMany();
  await prisma.activityLog.deleteMany();
  await prisma.approval.deleteMany();
  await prisma.document.deleteMany();
  await prisma.changeRequest.deleteMany();
  await prisma.requirementStage.deleteMany();
  await prisma.requirement.deleteMany();
  await prisma.project.deleteMany();
  await rm("/tmp/softfactory-workspace", { recursive: true, force: true });
});

test("generates a requirement document on disk and in the database", async () => {
  const project = await createProject({
    name: "Delta Factory",
    summary: "Project for docs",
    goal: "Generate requirement docs",
  });

  const requirement = await createRequirement({
    projectId: project.id,
    title: "Write requirement docs",
    originalRequest: "Need requirement docs",
    normalizedDescription: "Need requirement docs",
    priority: "medium",
  });

  const document = await generateRequirementDocument({
    project,
    requirement,
  });

  const file = await stat(document.filePath);

  expect(file.isFile()).toBe(true);
  expect(document.documentType).toBe("requirement");
});
