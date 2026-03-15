import { access } from "node:fs/promises";
import { beforeEach, expect, test } from "vitest";
import { prisma } from "@/lib/db";
import { createExecutionRun, getExecutionRunDetail } from "@/lib/services/execution-service";
import { createProject } from "@/lib/services/project-service";
import { createRequirement } from "@/lib/services/requirement-service";
import { processNextExecutionRun } from "@/lib/services/execution-worker-service";

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

test("processes a queued auto-flow run to success with the fake runner", async () => {
  const project = await createProject({
    name: "Worker Factory",
    summary: "Run auto-flow execution",
    goal: "Process execution runs end-to-end",
  });

  const requirement = await createRequirement({
    projectId: project.id,
    title: "Execute the worker pipeline",
    originalRequest: "Run design, development, and test with fake outputs.",
    normalizedDescription: "Exercise the worker pipeline with deterministic output.",
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
    executionMode: "auto_flow",
  });

  const result = await processNextExecutionRun();

  expect(result?.status).toBe("succeeded");
  expect(result?.id).toBe(run.id);

  const detail = await getExecutionRunDetail(run.id);
  expect(detail?.stageRuns).toHaveLength(3);
  expect(detail?.stageRuns.every((stageRun) => stageRun.status === "succeeded")).toBe(true);
  expect(detail?.artifacts).toHaveLength(3);

  await expect(access(detail?.stageRuns[0]?.stdoutPath ?? "")).resolves.toBeUndefined();
});
