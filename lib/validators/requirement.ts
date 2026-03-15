import { z } from "zod";

export const createRequirementSchema = z.object({
  projectId: z.string().trim().min(1, "Project is required"),
  title: z.string().trim().min(1, "Title is required"),
  originalRequest: z.string().trim().min(1, "Original request is required"),
  normalizedDescription: z
    .string()
    .trim()
    .min(1, "Normalized description is required"),
  priority: z.string().trim().min(1, "Priority is required"),
});

export type CreateRequirementInput = z.infer<typeof createRequirementSchema>;
