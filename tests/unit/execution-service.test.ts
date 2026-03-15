import { beforeEach, expect, test } from "vitest";
import { prisma } from "@/lib/db";
import { createExecutionRun, getExecutionRunDetail, listExecutionRunsByRequirement } from "@/lib/services/execution-service";

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

test("creates a queued manual-gate run for a requirement", async () => {
  const project = await prisma.project.create({
    data: {
      name: "Execution Factory",
      slug: "execution-factory",
      summary: "Track stage execution",
      goal: "Create the execution domain",
    },
  });

  const requirement = await prisma.requirement.create({
    data: {
      projectId: project.id,
      title: "Implement agent execution",
      originalRequest: "Build the run orchestration flow.",
      normalizedDescription: "Run agent execution over requirement stages.",
      priority: "high",
    },
  });

  await prisma.requirementStage.createMany({
    data: [
      {
        requirementId: requirement.id,
        stageType: "requirement",
        status: "completed",
      },
      {
        requirementId: requirement.id,
        stageType: "design",
        status: "pending_confirmation",
      },
      {
        requirementId: requirement.id,
        stageType: "development",
        status: "not_started",
      },
      {
        requirementId: requirement.id,
        stageType: "test",
        status: "not_started",
      },
      {
        requirementId: requirement.id,
        stageType: "approval",
        status: "not_started",
      },
    ],
  });

  const run = await createExecutionRun({
    requirementId: requirement.id,
    runType: "full_run",
    executionMode: "manual_gate",
  });

  expect(run.status).toBe("queued");
  expect(run.currentStage).toBe("design");
  expect(run.projectId).toBe(project.id);
  expect(run.requirementId).toBe(requirement.id);

  const runs = await listExecutionRunsByRequirement(requirement.id);
  expect(runs).toHaveLength(1);
  expect(runs[0]?.id).toBe(run.id);

  const detail = await getExecutionRunDetail(run.id);
  expect(detail?.id).toBe(run.id);
  expect(detail?.stageRuns).toEqual([]);
});

test("creates a stage run with the target stage as current stage", async () => {
  const project = await prisma.project.create({
    data: {
      name: "Stage Factory",
      slug: "stage-factory",
      summary: "Track one stage at a time",
      goal: "Execute design only",
    },
  });

  const requirement = await prisma.requirement.create({
    data: {
      projectId: project.id,
      title: "Run one stage",
      originalRequest: "Only execute the test stage.",
      normalizedDescription: "Support stage-scoped execution runs.",
      priority: "medium",
    },
  });

  await prisma.requirementStage.createMany({
    data: [
      { requirementId: requirement.id, stageType: "requirement", status: "completed" },
      { requirementId: requirement.id, stageType: "design", status: "completed" },
      { requirementId: requirement.id, stageType: "development", status: "completed" },
      { requirementId: requirement.id, stageType: "test", status: "not_started" },
      { requirementId: requirement.id, stageType: "approval", status: "not_started" },
    ],
  });

  const run = await createExecutionRun({
    requirementId: requirement.id,
    runType: "stage_run",
    executionMode: "auto_flow",
    targetStage: "test",
  });

  expect(run.currentStage).toBe("test");
  expect(run.targetStage).toBe("test");
  expect(run.executionMode).toBe("auto_flow");
});

test("ignores targetStage for full runs instead of throwing", async () => {
  const project = await prisma.project.create({
    data: {
      name: "Launch Factory",
      slug: "launch-factory",
      summary: "Handle launch form input safely",
      goal: "Do not fail on full_run submissions",
    },
  });

  const requirement = await prisma.requirement.create({
    data: {
      projectId: project.id,
      title: "Launch without stage override",
      originalRequest: "Start a full run from the requirement detail page.",
      normalizedDescription: "Full runs should ignore targetStage form noise.",
      priority: "high",
    },
  });

  await prisma.requirementStage.createMany({
    data: [
      { requirementId: requirement.id, stageType: "requirement", status: "completed" },
      { requirementId: requirement.id, stageType: "design", status: "pending_confirmation" },
      { requirementId: requirement.id, stageType: "development", status: "not_started" },
      { requirementId: requirement.id, stageType: "test", status: "not_started" },
      { requirementId: requirement.id, stageType: "approval", status: "not_started" },
    ],
  });

  const run = await createExecutionRun({
    requirementId: requirement.id,
    runType: "full_run",
    executionMode: "manual_gate",
    targetStage: "design",
  });

  expect(run.status).toBe("queued");
  expect(run.currentStage).toBe("design");
  expect(run.targetStage).toBeNull();
});
