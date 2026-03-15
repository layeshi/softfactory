export const PROJECT_STATUSES = [
  "draft",
  "in_progress",
  "blocked",
  "completed",
  "archived",
] as const;

export const REQUIREMENT_STATUSES = [
  "pending_triage",
  "in_progress",
  "pending_approval",
  "completed",
  "changed",
] as const;

export const REQUIREMENT_LIFECYCLE_STATUSES = [
  "active",
  "changed",
  "removed",
] as const;

export const REQUIREMENT_STAGES = [
  "requirement",
  "design",
  "development",
  "test",
  "approval",
] as const;

export const STAGE_STATUSES = [
  "not_started",
  "in_progress",
  "pending_confirmation",
  "completed",
  "rejected",
] as const;

export const CHANGE_REQUEST_TYPES = ["modify", "add", "delete"] as const;

export const CHANGE_REQUEST_STATUSES = [
  "draft",
  "pending_approval",
  "approved",
  "rejected",
  "applied",
] as const;

export const APPROVAL_TYPES = [
  "requirement_confirmation",
  "design_confirmation",
  "test_confirmation",
  "change_request_confirmation",
] as const;

export const EXECUTION_RUN_TYPES = ["full_run", "stage_run"] as const;

export const EXECUTION_MODES = ["manual_gate", "auto_flow"] as const;

export const EXECUTION_RUN_STATUSES = [
  "queued",
  "preparing",
  "running",
  "waiting_for_decision",
  "succeeded",
  "failed",
  "cancelled",
] as const;

export const EXECUTION_STAGE_RUN_STATUSES = [
  "pending",
  "running",
  "waiting_for_decision",
  "succeeded",
  "failed",
  "skipped",
] as const;

export const EXECUTION_DECISION_TYPES = [
  "design_review",
  "implementation_review",
  "test_review",
] as const;

export const EXECUTION_DECISION_STATUSES = [
  "pending",
  "approved",
  "rejected",
] as const;
