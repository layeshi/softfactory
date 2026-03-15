import { prisma } from "@/lib/db";
import { logActivity } from "@/lib/services/activity-service";
import { createRequirement } from "@/lib/services/requirement-service";
import {
  createChangeRequestSchema,
  type CreateChangeRequestInput,
} from "@/lib/validators/change-request";

export async function createChangeRequest(input: CreateChangeRequestInput) {
  const data = createChangeRequestSchema.parse(input);

  const changeRequest = await prisma.changeRequest.create({
    data: {
      ...data,
      status: "pending_approval",
    },
  });

  await prisma.approval.create({
    data: {
      projectId: data.projectId,
      changeRequestId: changeRequest.id,
      approvalType: "change_request_confirmation",
      status: "pending",
    },
  });

  await logActivity({
    projectId: data.projectId,
    changeRequestId: changeRequest.id,
    actionType: "change_request.created",
    message: `Change request ${changeRequest.changeType} created.`,
  });

  return changeRequest;
}

export async function approveChangeRequest(changeRequestId: string) {
  const changeRequest = await prisma.changeRequest.findUnique({
    where: {
      id: changeRequestId,
    },
  });

  if (!changeRequest) {
    throw new Error("Change request not found");
  }

  let createdRequirement: Awaited<ReturnType<typeof createRequirement>> | null = null;

  if (changeRequest.changeType === "add") {
    createdRequirement = await createRequirement({
      projectId: changeRequest.projectId,
      title: changeRequest.proposedTitle ?? "Untitled requirement",
      originalRequest: changeRequest.proposedContent ?? "",
      normalizedDescription: changeRequest.proposedContent ?? "",
      priority: "medium",
    });
  }

  if (changeRequest.changeType === "modify" && changeRequest.targetRequirementId) {
    await prisma.requirement.update({
      where: {
        id: changeRequest.targetRequirementId,
      },
      data: {
        title: changeRequest.proposedTitle ?? undefined,
        normalizedDescription: changeRequest.proposedContent ?? undefined,
        lifecycleStatus: "changed",
        status: "changed",
        version: {
          increment: 1,
        },
      },
    });
  }

  if (changeRequest.changeType === "delete" && changeRequest.targetRequirementId) {
    await prisma.requirement.update({
      where: {
        id: changeRequest.targetRequirementId,
      },
      data: {
        lifecycleStatus: "removed",
      },
    });
  }

  const updatedChangeRequest = await prisma.changeRequest.update({
    where: {
      id: changeRequest.id,
    },
    data: {
      status: "applied",
      appliedAt: new Date(),
    },
  });

  await prisma.approval.updateMany({
    where: {
      changeRequestId: changeRequest.id,
      status: "pending",
    },
    data: {
      status: "approved",
      decidedAt: new Date(),
    },
  });

  await logActivity({
    projectId: changeRequest.projectId,
    changeRequestId: changeRequest.id,
    actionType: "change_request.approved",
    message: `Change request ${changeRequest.changeType} approved.`,
  });

  return {
    changeRequest: updatedChangeRequest,
    createdRequirement,
  };
}

export async function listChangeRequests(projectId?: string) {
  return prisma.changeRequest.findMany({
    where: projectId
      ? {
          projectId,
        }
      : undefined,
    orderBy: {
      createdAt: "desc",
    },
  });
}
