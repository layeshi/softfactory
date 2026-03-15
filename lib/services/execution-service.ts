import { prisma } from "@/lib/db";
import { REQUIREMENT_STAGES } from "@/lib/constants/workflow";
import {
  createExecutionRunSchema,
  type CreateExecutionRunInput,
  EXECUTABLE_REQUIREMENT_STAGES,
} from "@/lib/validators/execution-run";
import {
  getExecutionRunDetail,
  listExecutionRunsByRequirement,
} from "@/lib/services/execution-run-query-service";

function resolveCurrentStage(
  runType: "full_run" | "stage_run",
  targetStage: CreateExecutionRunInput["targetStage"],
  stages: Array<{ stageType: string; status: string }>,
) {
  if (runType === "stage_run") {
    return targetStage ?? null;
  }

  const stageMap = new Map(stages.map((stage) => [stage.stageType, stage.status]));

  return (
    EXECUTABLE_REQUIREMENT_STAGES.find((stageType) => {
      const status = stageMap.get(stageType);
      return status !== "completed";
    }) ?? null
  );
}

function isRequirementStage(
  value: string,
): value is (typeof REQUIREMENT_STAGES)[number] {
  return REQUIREMENT_STAGES.includes(value as (typeof REQUIREMENT_STAGES)[number]);
}

function isExecutableRequirementStage(
  value: string,
): value is (typeof EXECUTABLE_REQUIREMENT_STAGES)[number] {
  return EXECUTABLE_REQUIREMENT_STAGES.includes(
    value as (typeof EXECUTABLE_REQUIREMENT_STAGES)[number],
  );
}

export async function createExecutionRun(input: CreateExecutionRunInput) {
  const normalizedInput =
    input.runType === "full_run" ? { ...input, targetStage: undefined } : input;
  const data = createExecutionRunSchema.parse(normalizedInput);

  const requirement = await prisma.requirement.findUnique({
    where: {
      id: data.requirementId,
    },
    include: {
      stages: true,
    },
  });

  if (!requirement) {
    throw new Error("Requirement not found");
  }

  const currentStage = resolveCurrentStage(
    data.runType,
    data.targetStage,
    requirement.stages,
  );

  if (!currentStage || !isRequirementStage(currentStage)) {
    throw new Error("No executable stage available for this requirement");
  }

  if (data.runType === "stage_run" && !isExecutableRequirementStage(currentStage)) {
    throw new Error("Unsupported target stage");
  }

  return prisma.executionRun.create({
    data: {
      projectId: requirement.projectId,
      requirementId: requirement.id,
      runType: data.runType,
      executionMode: data.executionMode,
      targetStage: data.targetStage,
      currentStage,
      status: "queued",
    },
  });
}

export { getExecutionRunDetail, listExecutionRunsByRequirement };
