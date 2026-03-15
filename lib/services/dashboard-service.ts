import { prisma } from "@/lib/db";

export async function getDashboardSummary() {
  const [
    projectCount,
    inProgressProjects,
    blockedProjects,
    pendingApprovals,
    recentChanges,
    recentDocuments,
    recentActivity,
  ] = await Promise.all([
    prisma.project.count(),
    prisma.project.count({
      where: {
        status: "in_progress",
      },
    }),
    prisma.project.count({
      where: {
        status: "blocked",
      },
    }),
    prisma.approval.count({
      where: {
        status: "pending",
      },
    }),
    prisma.changeRequest.findMany({
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
    }),
    prisma.document.findMany({
      orderBy: {
        generatedAt: "desc",
      },
      take: 5,
    }),
    prisma.activityLog.findMany({
      orderBy: {
        createdAt: "desc",
      },
      take: 8,
    }),
  ]);

  return {
    projectCount,
    inProgressProjects,
    blockedProjects,
    pendingApprovals,
    recentChanges,
    recentDocuments,
    recentActivity,
  };
}
