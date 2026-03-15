import { prisma } from "@/lib/db";

export async function listExecutionRunsByRequirement(requirementId: string) {
  return prisma.executionRun.findMany({
    where: {
      requirementId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getExecutionRunDetail(runId: string) {
  return prisma.executionRun.findUnique({
    where: {
      id: runId,
    },
    include: {
      stageRuns: {
        orderBy: {
          createdAt: "asc",
        },
      },
      artifacts: {
        orderBy: {
          createdAt: "asc",
        },
      },
      decisions: {
        orderBy: {
          createdAt: "asc",
        },
      },
      requirement: true,
      project: true,
    },
  });
}
