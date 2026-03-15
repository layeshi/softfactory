import { beforeEach, expect, test } from "vitest";
import { access, rm } from "node:fs/promises";
import { join } from "node:path";
import { prisma } from "@/lib/db";
import { createProject } from "@/lib/services/project-service";
import { getWorkspaceRoot } from "@/lib/services/workspace-service";

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
  await rm(join(getWorkspaceRoot(), "projects", "alpha-factory"), {
    recursive: true,
    force: true,
  });
});

test("creates a project with draft status by default", async () => {
  const project = await createProject({
    name: "Alpha Factory",
    summary: "Track the first project",
    goal: "Validate the MVP",
  });

  expect(project.status).toBe("draft");
  await expect(
    access(join(getWorkspaceRoot(), "projects", project.slug, "repo", ".git")),
  ).resolves.toBeUndefined();
});
