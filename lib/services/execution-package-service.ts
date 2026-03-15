import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { prisma } from "@/lib/db";
import { ensureProjectRepo } from "@/lib/services/repo-service";
import { resolveStagesToRun } from "@/lib/services/execution-stage-service";

export async function buildExecutionTaskPackage(runId: string) {
  const run = await prisma.executionRun.findUnique({
    where: {
      id: runId,
    },
    include: {
      project: true,
      requirement: {
        include: {
          documents: {
            orderBy: {
              generatedAt: "desc",
            },
          },
          approvals: {
            orderBy: {
              createdAt: "desc",
            },
          },
        },
      },
    },
  });

  if (!run) {
    throw new Error("Execution run not found");
  }

  const repo = await ensureProjectRepo(run.project.slug);
  const runDirectory = join(repo.projectRoot, "runs", run.id);
  const artifactsDirectory = join(runDirectory, "artifacts");
  const taskPackagePath = join(runDirectory, "task.json");
  const stagesToRun = resolveStagesToRun({
    runType: run.runType as "full_run" | "stage_run",
    currentStage: run.currentStage,
    targetStage: run.targetStage,
  });
  const decisionStages =
    run.executionMode === "manual_gate" ? [...stagesToRun] : [];

  await mkdir(artifactsDirectory, { recursive: true });

  const taskPackage = {
    run: {
      runId: run.id,
      runType: run.runType,
      executionMode: run.executionMode,
      targetStage: run.targetStage,
    },
    project: {
      projectId: run.project.id,
      name: run.project.name,
      slug: run.project.slug,
      workspacePath: repo.projectRoot,
      repoPath: repo.repoPath,
    },
    requirement: {
      requirementId: run.requirement.id,
      title: run.requirement.title,
      originalRequest: run.requirement.originalRequest,
      normalizedDescription: run.requirement.normalizedDescription,
      priority: run.requirement.priority,
      version: run.requirement.version,
    },
    workflow: {
      currentStage: run.currentStage,
      stagesToRun,
      decisionStages,
    },
    context: {
      documentPaths: run.requirement.documents.map((document) => document.filePath),
      recentChangeSummary: [],
      recentApprovalSummary: run.requirement.approvals.map((approval) => ({
        type: approval.approvalType,
        status: approval.status,
        comment: approval.comment,
      })),
    },
    outputContract: {
      artifacts: stagesToRun.map((stageType) => `${stageType}_summary`),
      writePaths: stagesToRun.map((stageType) =>
        join(artifactsDirectory, `${stageType}-summary.md`),
      ),
      summaryRequired: true,
    },
    command: {
      type: "claude_code",
      argv: [],
      cwd: repo.repoPath,
    },
  };

  await writeFile(taskPackagePath, JSON.stringify(taskPackage, null, 2), "utf8");

  await prisma.executionRun.update({
    where: {
      id: run.id,
    },
    data: {
      workspacePath: repo.projectRoot,
      repoPath: repo.repoPath,
      taskPackagePath,
    },
  });

  return taskPackage;
}
