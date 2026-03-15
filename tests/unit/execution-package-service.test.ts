import { access, readFile } from "node:fs/promises";
import { beforeEach, expect, test } from "vitest";
import { prisma } from "@/lib/db";
import { createExecutionRun } from "@/lib/services/execution-service";
import { buildExecutionTaskPackage } from "@/lib/services/execution-package-service";
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

test("builds a task package with workflow and output contract", async () => {
  const project = await createProject({
    name: "Package Factory",
    summary: "Track execution package generation",
    goal: "Write task packages to disk",
  });

  const requirement = await createRequirement({
    projectId: project.id,
    title: "Prepare execution package",
    originalRequest: "Generate a run package for design, development, and test.",
    normalizedDescription: "Build a persisted task package for execution.",
    priority: "high",
  });

  await prisma.requirementStage.update({
    where: {
      requirementId_stageType: {
        requirementId: requirement.id,
        stageType: "requirement",
      },
    },
    data: {
      status: "completed",
    },
  });

  const run = await createExecutionRun({
    requirementId: requirement.id,
    runType: "full_run",
    executionMode: "manual_gate",
  });

  const taskPackage = await buildExecutionTaskPackage(run.id);

  expect(taskPackage.run.executionMode).toBe("manual_gate");
  expect(taskPackage.workflow.stagesToRun).toEqual([
    "design",
    "development",
    "test",
  ]);
  expect(taskPackage.workflow.decisionStages).toEqual(["design", "development", "test"]);
  expect(taskPackage.project.repoPath).toContain(`/projects/${project.slug}/repo`);

  const refreshedRun = await prisma.executionRun.findUniqueOrThrow({
    where: {
      id: run.id,
    },
  });

  expect(refreshedRun.taskPackagePath).toBeTruthy();
  await expect(access(refreshedRun.taskPackagePath!)).resolves.toBeUndefined();

  const persistedPackage = JSON.parse(
    await readFile(refreshedRun.taskPackagePath!, "utf8"),
  );
  expect(persistedPackage.run.runId).toBe(run.id);
});
