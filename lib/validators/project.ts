import { z } from "zod";

export const createProjectSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  summary: z.string().trim().min(1, "Summary is required"),
  goal: z.string().trim().min(1, "Goal is required"),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
