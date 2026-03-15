import { prisma } from "@/lib/db";

type CreateExecutionArtifactInput = {
  executionRunId: string;
  executionStageRunId?: string;
  artifactType: string;
  title: string;
  filePath: string;
  summary?: string;
};

export async function createExecutionArtifact(input: CreateExecutionArtifactInput) {
  return prisma.executionArtifact.create({
    data: {
      executionRunId: input.executionRunId,
      executionStageRunId: input.executionStageRunId,
      artifactType: input.artifactType,
      title: input.title,
      filePath: input.filePath,
      summary: input.summary,
    },
  });
}
