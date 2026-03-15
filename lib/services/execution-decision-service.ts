import { readFile } from "node:fs/promises";
import { prisma } from "@/lib/db";

async function resolveNextStage(executionRunId: string, taskPackagePath: string | null) {
  if (!taskPackagePath) {
    return null;
  }

  const taskPackage = JSON.parse(await readFile(taskPackagePath, "utf8")) as {
    workflow: {
      stagesToRun: string[];
    };
  };

  const stageRuns = await prisma.executionStageRun.findMany({
    where: {
      executionRunId,
    },
  });

  return (
    taskPackage.workflow.stagesToRun.find((stageType) => {
      const stageRun = stageRuns.find((item) => item.stageType === stageType);
      return stageRun?.status !== "succeeded";
    }) ?? null
  );
}

export async function approveExecutionDecision(decisionId: string) {
  const decision = await prisma.executionDecision.findUnique({
    where: {
      id: decisionId,
    },
    include: {
      executionRun: true,
      executionStageRun: true,
    },
  });

  if (!decision) {
    throw new Error("Execution decision not found");
  }

  await prisma.executionDecision.update({
    where: {
      id: decisionId,
    },
    data: {
      status: "approved",
      decidedAt: new Date(),
    },
  });

  if (decision.executionStageRunId) {
    await prisma.executionStageRun.update({
      where: {
        id: decision.executionStageRunId,
      },
      data: {
        status: "succeeded",
        finishedAt: new Date(),
      },
    });
  }

  const nextStage = await resolveNextStage(
    decision.executionRunId,
    decision.executionRun.taskPackagePath,
  );

  return prisma.executionRun.update({
    where: {
      id: decision.executionRunId,
    },
    data: nextStage
      ? {
          status: "queued",
          currentStage: nextStage,
        }
      : {
          status: "succeeded",
          currentStage: null,
          finishedAt: new Date(),
        },
  });
}

export async function rejectExecutionDecision(decisionId: string, comment?: string) {
  const decision = await prisma.executionDecision.findUnique({
    where: {
      id: decisionId,
    },
    include: {
      executionRun: true,
    },
  });

  if (!decision) {
    throw new Error("Execution decision not found");
  }

  await prisma.executionDecision.update({
    where: {
      id: decisionId,
    },
    data: {
      status: "rejected",
      comment,
      decidedAt: new Date(),
    },
  });

  return prisma.executionRun.update({
    where: {
      id: decision.executionRunId,
    },
    data: {
      status: "failed",
      finishedAt: new Date(),
    },
  });
}
