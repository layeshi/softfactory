import { beforeEach, expect, test } from "vitest";
import { prisma } from "@/lib/db";
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
});

test("creates requirement stage rows in fixed order", async () => {
  const project = await createProject({
    name: "Beta Factory",
    summary: "Project for requirement flow",
    goal: "Track lifecycle",
  });

  const requirement = await createRequirement({
    projectId: project.id,
    title: "Requirement A",
    originalRequest: "Build reporting",
    normalizedDescription: "Structured reporting requirement",
    priority: "high",
  });

  expect(requirement.stages.map((stage) => stage.stageType)).toEqual([
    "requirement",
    "design",
    "development",
    "test",
    "approval",
  ]);
});
