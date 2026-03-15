import { prisma } from "@/lib/db";
import { REQUIREMENT_STAGES } from "@/lib/constants/workflow";
import { logActivity } from "@/lib/services/activity-service";
import {
  createRequirementSchema,
  type CreateRequirementInput,
} from "@/lib/validators/requirement";

function sortStages<T extends { stageType: string }>(stages: T[]) {
  return [...stages].sort(
    (left, right) =>
      REQUIREMENT_STAGES.indexOf(left.stageType as (typeof REQUIREMENT_STAGES)[number]) -
      REQUIREMENT_STAGES.indexOf(right.stageType as (typeof REQUIREMENT_STAGES)[number]),
  );
}

export async function createRequirement(input: CreateRequirementInput) {
  const data = createRequirementSchema.parse(input);

  const requirement = await prisma.requirement.create({
    data: {
      ...data,
      stages: {
        create: REQUIREMENT_STAGES.map((stageType) => ({
          stageType,
        })),
      },
    },
    include: {
      stages: {
        orderBy: {
          updatedAt: "asc",
        },
      },
    },
  });

  await logActivity({
    projectId: requirement.projectId,
    requirementId: requirement.id,
    actionType: "requirement.created",
    message: `Requirement ${requirement.title} created.`,
  });

  return {
    ...requirement,
    stages: sortStages(requirement.stages),
  };
}

export async function listRequirementsByProject(projectId: string) {
  const requirements = await prisma.requirement.findMany({
    where: {
      projectId,
      lifecycleStatus: {
        not: "removed",
      },
    },
    include: {
      stages: {
        orderBy: {
          updatedAt: "asc",
        },
      },
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  return requirements.map((requirement) => ({
    ...requirement,
    stages: sortStages(requirement.stages),
  }));
}

export async function getRequirementDetail(requirementId: string) {
  const requirement = await prisma.requirement.findUnique({
    where: {
      id: requirementId,
    },
    include: {
      stages: true,
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
  });

  if (!requirement) {
    return null;
  }

  return {
    ...requirement,
    stages: sortStages(requirement.stages),
  };
}
