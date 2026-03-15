import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.activityLog.deleteMany();
  await prisma.approval.deleteMany();
  await prisma.document.deleteMany();
  await prisma.changeRequest.deleteMany();
  await prisma.requirementStage.deleteMany();
  await prisma.requirement.deleteMany();
  await prisma.project.deleteMany();

  const project = await prisma.project.create({
    data: {
      name: "Alpha Factory",
      slug: "alpha-factory",
      summary: "Initial seeded software factory project.",
      goal: "Validate local project and requirement operations.",
      status: "in_progress",
    },
  });

  const requirement = await prisma.requirement.create({
    data: {
      projectId: project.id,
      title: "Create the first dashboard",
      originalRequest: "Build a dashboard for tracking active projects.",
      normalizedDescription: "Structured dashboard requirement.",
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

  await prisma.approval.create({
    data: {
      projectId: project.id,
      requirementId: requirement.id,
      approvalType: "design_confirmation",
      status: "pending",
    },
  });

  await prisma.document.create({
    data: {
      projectId: project.id,
      requirementId: requirement.id,
      documentType: "requirement",
      title: "Alpha Factory Requirement Brief",
      filePath: "workspace/projects/alpha-factory/docs/requirements/alpha-factory-requirement.md",
    },
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
