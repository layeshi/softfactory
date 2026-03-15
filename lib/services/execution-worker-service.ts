import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { prisma } from "@/lib/db";
import { createExecutionArtifact } from "@/lib/services/execution-artifact-service";
import { buildExecutionTaskPackage } from "@/lib/services/execution-package-service";
import { createExecutionCommandRunner } from "@/lib/services/execution-command-service";
import { createExecutionWorktree, ensureProjectRepo } from "@/lib/services/repo-service";

async function getQueuedRun() {
  return prisma.executionRun.findFirst({
    where: {
      status: "queued",
    },
    orderBy: {
      createdAt: "asc",
    },
    include: {
      project: true,
      requirement: true,
      stageRuns: {
        orderBy: {
          createdAt: "asc",
        },
      },
      decisions: {
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });
}

function findUnfinishedStage(
  stagesToRun: string[],
  stageRuns: Array<{ stageType: string; status: string }>,
) {
  return stagesToRun.find((stageType) => {
    const stageRun = stageRuns.find((item) => item.stageType === stageType);
    return stageRun?.status !== "succeeded";
  });
}

export async function processNextExecutionRun() {
  const queuedRun = await getQueuedRun();

  if (!queuedRun) {
    return null;
  }

  const repo = await ensureProjectRepo(queuedRun.project.slug);
  const runDirectory = join(repo.projectRoot, "runs", queuedRun.id);
  const worktreePath = join(repo.tempPath, queuedRun.id);
  const branchName = `run-${queuedRun.id}`;

  await mkdir(runDirectory, { recursive: true });
  await createExecutionWorktree({
    repoPath: repo.repoPath,
    worktreePath,
    branchName,
  });

  await prisma.executionRun.update({
    where: {
      id: queuedRun.id,
    },
    data: {
      status: "preparing",
      startedAt: queuedRun.startedAt ?? new Date(),
      workspacePath: repo.projectRoot,
      repoPath: repo.repoPath,
      worktreePath,
    },
  });

  const taskPackage = await buildExecutionTaskPackage(queuedRun.id);
  const taskPackagePath = join(runDirectory, "task.json");
  const runner = createExecutionCommandRunner();
  while (true) {
    const refreshedRun = await prisma.executionRun.findUniqueOrThrow({
      where: {
        id: queuedRun.id,
      },
      include: {
        stageRuns: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });
    const nextStage = findUnfinishedStage(
      taskPackage.workflow.stagesToRun,
      refreshedRun.stageRuns,
    );

    if (!nextStage) {
      return prisma.executionRun.update({
        where: {
          id: queuedRun.id,
        },
        data: {
          status: "succeeded",
          currentStage: null,
          finishedAt: new Date(),
        },
      });
    }

    await prisma.executionRun.update({
      where: {
        id: queuedRun.id,
      },
      data: {
        status: "running",
        currentStage: nextStage,
      },
    });

    const stageRun = await prisma.executionStageRun.create({
      data: {
        executionRunId: queuedRun.id,
        stageType: nextStage,
        status: "running",
        inputSnapshotPath: join(runDirectory, `${nextStage}.input.json`),
        startedAt: new Date(),
      },
    });

    await writeFile(
      stageRun.inputSnapshotPath!,
      JSON.stringify(
        {
          runId: queuedRun.id,
          stageType: nextStage,
          requirementId: queuedRun.requirement.id,
        },
        null,
        2,
      ),
      "utf8",
    );

    try {
      const commandResult = await runner.executeStage({
        runId: queuedRun.id,
        stageType: nextStage,
        runDirectory,
        worktreePath,
        taskPackagePath,
      });

      const needsDecision = taskPackage.workflow.decisionStages.includes(nextStage);

      await prisma.executionStageRun.update({
        where: {
          id: stageRun.id,
        },
        data: {
          status: needsDecision ? "waiting_for_decision" : "succeeded",
          resultSnapshotPath: commandResult.resultSnapshotPath,
          stdoutPath: commandResult.stdoutPath,
          stderrPath: commandResult.stderrPath,
          finishedAt: new Date(),
        },
      });

      await createExecutionArtifact({
        executionRunId: queuedRun.id,
        executionStageRunId: stageRun.id,
        artifactType: `${nextStage}_summary`,
        title: `${nextStage} summary`,
        filePath: commandResult.artifactPath,
        summary: commandResult.summary,
      });

      if (needsDecision) {
        await prisma.executionDecision.create({
          data: {
            executionRunId: queuedRun.id,
            executionStageRunId: stageRun.id,
            decisionType:
              nextStage === "design"
                ? "design_review"
                : nextStage === "development"
                  ? "implementation_review"
                  : "test_review",
            status: "pending",
          },
        });

        return prisma.executionRun.update({
          where: {
            id: queuedRun.id,
          },
          data: {
            status: "waiting_for_decision",
            currentStage: nextStage,
            worktreePath,
          },
        });
      }

      await prisma.executionRun.update({
        where: {
          id: queuedRun.id,
        },
        data: {
          status: "queued",
          currentStage: nextStage,
          worktreePath,
        },
      });
    } catch {
      await prisma.executionStageRun.update({
        where: {
          id: stageRun.id,
        },
        data: {
          status: "failed",
          finishedAt: new Date(),
        },
      });

      return prisma.executionRun.update({
        where: {
          id: queuedRun.id,
        },
        data: {
          status: "failed",
          worktreePath,
          finishedAt: new Date(),
        },
      });
    }
  }
}
