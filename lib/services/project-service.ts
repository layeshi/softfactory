import { prisma } from "@/lib/db";
import { logActivity } from "@/lib/services/activity-service";
import { ensureProjectRepo } from "@/lib/services/repo-service";
import {
  createProjectSchema,
  type CreateProjectInput,
} from "@/lib/validators/project";

function slugifyProjectName(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function createProject(input: CreateProjectInput) {
  const data = createProjectSchema.parse(input);
  const slugBase = slugifyProjectName(data.name);
  const existingCount = await prisma.project.count({
    where: {
      slug: {
        startsWith: slugBase,
      },
    },
  });
  const slug = existingCount === 0 ? slugBase : `${slugBase}-${existingCount + 1}`;

  const project = await prisma.project.create({
    data: {
      ...data,
      slug,
    },
  });

  await ensureProjectRepo(project.slug);

  await logActivity({
    projectId: project.id,
    actionType: "project.created",
    message: `Project ${project.name} created.`,
  });

  return project;
}

export async function listProjects() {
  const projects = await prisma.project.findMany({
    include: {
      requirements: {
        where: {
          lifecycleStatus: {
            not: "removed",
          },
        },
      },
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  return projects.map((project) => ({
    ...project,
    requirementCount: project.requirements.length,
  }));
}

export async function getProjectDetail(projectId: string) {
  return prisma.project.findUnique({
    where: {
      id: projectId,
    },
    include: {
      requirements: {
        where: {
          lifecycleStatus: {
            not: "removed",
          },
        },
        include: {
          stages: true,
        },
        orderBy: {
          updatedAt: "desc",
        },
      },
      approvals: {
        orderBy: {
          createdAt: "desc",
        },
      },
      documents: {
        orderBy: {
          generatedAt: "desc",
        },
      },
      activityLogs: {
        orderBy: {
          createdAt: "desc",
        },
        take: 10,
      },
      changeRequests: {
        orderBy: {
          createdAt: "desc",
        },
      },
      executionRuns: {
        orderBy: {
          createdAt: "desc",
        },
        take: 5,
      },
    },
  });
}
