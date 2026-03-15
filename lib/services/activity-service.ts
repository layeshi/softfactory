import { prisma } from "@/lib/db";

type LogActivityInput = {
  projectId: string;
  actionType: string;
  message: string;
  requirementId?: string;
  changeRequestId?: string;
};

export async function logActivity(input: LogActivityInput) {
  return prisma.activityLog.create({
    data: input,
  });
}
