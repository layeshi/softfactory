import { z } from "zod";

export const createChangeRequestSchema = z.object({
  projectId: z.string().trim().min(1, "Project is required"),
  targetRequirementId: z.string().trim().optional(),
  changeType: z.enum(["modify", "add", "delete"]),
  proposedTitle: z.string().trim().optional(),
  proposedContent: z.string().trim().optional(),
  reason: z.string().trim().min(1, "Reason is required"),
  impactSummary: z.string().trim().min(1, "Impact summary is required"),
});

export type CreateChangeRequestInput = z.infer<typeof createChangeRequestSchema>;
