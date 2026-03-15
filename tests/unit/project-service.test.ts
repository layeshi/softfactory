import { beforeEach, expect, test } from "vitest";
import { prisma } from "@/lib/db";
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

test("creates a project with draft status by default", async () => {
  const project = await createProject({
    name: "Alpha Factory",
    summary: "Track the first project",
    goal: "Validate the MVP",
  });

  expect(project.status).toBe("draft");
});
