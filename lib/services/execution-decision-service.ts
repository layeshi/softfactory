import { readFile } from "node:fs/promises";
import { prisma } from "@/lib/db";
import { EXECUTABLE_REQUIREMENT_STAGES } from "@/lib/validators/execution-run";

type ExecutionRunContext = {
  id: string;
  runType: string;
  currentStage: string | null;
  targetStage: string | null;
  taskPackagePath: string | null;
};

async function resolveNextStageFromFallback(run: ExecutionRunContext) {
  if (run.runType === "stage_run") {
    return null;
  }

  const currentStageIndex = run.currentStage
    ? EXECUTABLE_REQUIREMENT_STAGES.indexOf(
        run.currentStage as (typeof EXECUTABLE_REQUIREMENT_STAGES)[number],
      )
    : -1;

  return EXECUTABLE_REQUIREMENT_STAGES.at(currentStageIndex + 1) ?? null;
}

async function resolveNextStage(run: ExecutionRunContext) {
  if (!run.taskPackagePath) {
    return resolveNextStageFromFallback(run);
  }

  try {
    const taskPackage = JSON.parse(await readFile(run.taskPackagePath, "utf8")) as {
    workflow: {
      stagesToRun: string[];
    };
    };

    const stageRuns = await prisma.executionStageRun.findMany({
      where: {
        executionRunId: run.id,
      },
    });

    return (
      taskPackage.workflow.stagesToRun.find((stageType) => {
        const stageRun = stageRuns.find((item) => item.stageType === stageType);
        return stageRun?.status !== "succeeded";
      }) ?? null
    );
  } catch {
    return resolveNextStageFromFallback(run);
  }
}

export async function approveExecutionDecision(decisionId: string) {
  const decision = await prisma.executionDecision.findUnique({
    where: {
      id: decisionId,
    },
    include: {
      executionRun: {
        select: {
          id: true,
          runType: true,
          currentStage: true,
          targetStage: true,
          taskPackagePath: true,
        },
      },
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

  const nextStage = await resolveNextStage(decision.executionRun);

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
