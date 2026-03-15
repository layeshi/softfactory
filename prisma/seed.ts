import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
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

  const executionRun = await prisma.executionRun.create({
    data: {
      projectId: project.id,
      requirementId: requirement.id,
      runType: "full_run",
      executionMode: "manual_gate",
      status: "waiting_for_decision",
      currentStage: "design",
      workspacePath: "/tmp/softfactory-workspace/projects/alpha-factory",
      repoPath: "/tmp/softfactory-workspace/projects/alpha-factory/repo",
      worktreePath: "/tmp/softfactory-workspace/projects/alpha-factory/temp/run-design",
      taskPackagePath:
        "/tmp/softfactory-workspace/projects/alpha-factory/runs/seed-run/task.json",
      startedAt: new Date(),
    },
  });

  const stageRun = await prisma.executionStageRun.create({
    data: {
      executionRunId: executionRun.id,
      stageType: "design",
      status: "waiting_for_decision",
      inputSnapshotPath:
        "/tmp/softfactory-workspace/projects/alpha-factory/runs/seed-run/design-input.json",
      resultSnapshotPath:
        "/tmp/softfactory-workspace/projects/alpha-factory/runs/seed-run/design-result.json",
      stdoutPath:
        "/tmp/softfactory-workspace/projects/alpha-factory/runs/seed-run/stdout.log",
      stderrPath:
        "/tmp/softfactory-workspace/projects/alpha-factory/runs/seed-run/stderr.log",
      startedAt: new Date(),
    },
  });

  await prisma.executionArtifact.create({
    data: {
      executionRunId: executionRun.id,
      executionStageRunId: stageRun.id,
      artifactType: "design_summary",
      title: "Seeded Design Summary",
      filePath:
        "/tmp/softfactory-workspace/projects/alpha-factory/runs/seed-run/artifacts/design-summary.md",
      summary: "Seeded design output for the first execution run.",
    },
  });

  await prisma.executionDecision.create({
    data: {
      executionRunId: executionRun.id,
      executionStageRunId: stageRun.id,
      decisionType: "design_review",
      status: "pending",
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
