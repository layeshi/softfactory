import { beforeEach, expect, test } from "vitest";
import { prisma } from "@/lib/db";
import { createChangeRequest } from "@/lib/services/change-request-service";
import { getDashboardSummary } from "@/lib/services/dashboard-service";
import { createProject } from "@/lib/services/project-service";

beforeEach(async () => {
  await prisma.activityLog.deleteMany();
  await prisma.approval.deleteMany();
  await prisma.document.deleteMany();
  await prisma.changeRequest.deleteMany();
  await prisma.requirementStage.deleteMany();
  await prisma.requirement.deleteMany();
  await prisma.project.deleteMany();
});

test("returns pending approval and recent change request counts", async () => {
  const project = await createProject({
    name: "Epsilon Factory",
    summary: "Project for dashboard summary",
    goal: "Aggregate dashboard data",
  });

  await createChangeRequest({
    projectId: project.id,
    changeType: "add",
    proposedTitle: "Add reporting",
    proposedContent: "Add reporting requirement",
    reason: "Need more visibility",
    impactSummary: "Adds one requirement",
  });

  const summary = await getDashboardSummary();

  expect(summary.pendingApprovals).toBeGreaterThan(0);
  expect(summary.recentChanges.length).toBeGreaterThan(0);
});
