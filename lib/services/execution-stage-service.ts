import { EXECUTABLE_REQUIREMENT_STAGES } from "@/lib/validators/execution-run";

export function resolveStagesToRun(input: {
  runType: "full_run" | "stage_run";
  currentStage: string | null;
  targetStage?: string | null;
}) {
  if (!input.currentStage) {
    return [];
  }

  if (input.runType === "stage_run") {
    return input.targetStage ? [input.targetStage] : [input.currentStage];
  }

  const startIndex = EXECUTABLE_REQUIREMENT_STAGES.indexOf(
    input.currentStage as (typeof EXECUTABLE_REQUIREMENT_STAGES)[number],
  );

  if (startIndex === -1) {
    return [];
  }

  return EXECUTABLE_REQUIREMENT_STAGES.slice(startIndex);
}
