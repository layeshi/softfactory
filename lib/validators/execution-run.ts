import { z } from "zod";
import { EXECUTION_MODES, EXECUTION_RUN_TYPES } from "@/lib/constants/workflow";

export const EXECUTABLE_REQUIREMENT_STAGES = [
  "design",
  "development",
  "test",
] as const;

export const createExecutionRunSchema = z
  .object({
    requirementId: z.string().min(1),
    runType: z.enum(EXECUTION_RUN_TYPES),
    executionMode: z.enum(EXECUTION_MODES),
    targetStage: z.enum(EXECUTABLE_REQUIREMENT_STAGES).optional(),
  })
  .superRefine((value, context) => {
    if (value.runType === "stage_run" && !value.targetStage) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "targetStage is required for stage runs",
        path: ["targetStage"],
      });
    }

    if (value.runType === "full_run" && value.targetStage) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "targetStage is only supported for stage runs",
        path: ["targetStage"],
      });
    }
  });

export type CreateExecutionRunInput = z.infer<typeof createExecutionRunSchema>;
