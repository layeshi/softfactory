import { beforeEach, expect, test } from "vitest";
import { prisma } from "@/lib/db";
import { approveExecutionDecision } from "@/lib/services/execution-decision-service";
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

test("approves a waiting execution decision and allows the run to continue", async () => {
  const project = await createProject({
    name: "Decision Factory",
    summary: "Pause execution for review",
    goal: "Support manual-gate runs",
  });

  const requirement = await createRequirement({
    projectId: project.id,
    title: "Require design review",
    originalRequest: "Pause after design for human approval.",
    normalizedDescription: "Support approval gating in execution runs.",
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

  const firstPass = await processNextExecutionRun();

  expect(firstPass?.status).toBe("waiting_for_decision");

  const pendingDecision = await prisma.executionDecision.findFirstOrThrow({
    where: {
      executionRunId: run.id,
      status: "pending",
    },
  });

  await approveExecutionDecision(pendingDecision.id);

  const resumedRun = await processNextExecutionRun();
  expect(resumedRun?.status).toBe("waiting_for_decision");

  const detail = await getExecutionRunDetail(run.id);
  expect(detail?.decisions.filter((decision) => decision.status === "approved")).toHaveLength(1);
  expect(detail?.stageRuns.some((stageRun) => stageRun.stageType === "development")).toBe(true);
});
