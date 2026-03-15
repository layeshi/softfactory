import {
  EXECUTION_MODES,
  EXECUTION_RUN_STATUSES,
  EXECUTION_RUN_TYPES,
  EXECUTION_STAGE_RUN_STATUSES,
  PROJECT_STATUSES,
  REQUIREMENT_STAGES,
} from "@/lib/constants/workflow";

test("defines the fixed requirement stage order", () => {
  expect(REQUIREMENT_STAGES).toEqual([
    "requirement",
    "design",
    "development",
    "test",
    "approval",
  ]);
});

test("includes blocked as a project status", () => {
  expect(PROJECT_STATUSES).toContain("blocked");
});

test("defines supported execution modes", () => {
  expect(EXECUTION_MODES).toEqual(["manual_gate", "auto_flow"]);
});

test("defines supported run types", () => {
  expect(EXECUTION_RUN_TYPES).toEqual(["full_run", "stage_run"]);
});

test("defines execution run statuses", () => {
  expect(EXECUTION_RUN_STATUSES).toEqual([
    "queued",
    "preparing",
    "running",
    "waiting_for_decision",
    "succeeded",
    "failed",
    "cancelled",
  ]);
});

test("defines execution stage run statuses", () => {
  expect(EXECUTION_STAGE_RUN_STATUSES).toEqual([
    "pending",
    "running",
    "waiting_for_decision",
    "succeeded",
    "failed",
    "skipped",
  ]);
});
