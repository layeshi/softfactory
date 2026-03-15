import { beforeEach, expect, test } from "vitest";
import { prisma } from "@/lib/db";
import { createChangeRequest, approveChangeRequest } from "@/lib/services/change-request-service";
import { createProject } from "@/lib/services/project-service";

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

test("approving an add change request creates a new requirement", async () => {
  const project = await createProject({
    name: "Gamma Factory",
    summary: "Project for change requests",
    goal: "Handle requirement changes",
  });

  const changeRequest = await createChangeRequest({
    projectId: project.id,
    changeType: "add",
    proposedTitle: "New requirement",
    proposedContent: "Capture audit logs",
    reason: "Needed for traceability",
    impactSummary: "Adds one more requirement",
  });

  const result = await approveChangeRequest(changeRequest.id);

  expect(result.createdRequirement?.title).toBe("New requirement");
});
