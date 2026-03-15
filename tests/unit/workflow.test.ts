import { PROJECT_STATUSES, REQUIREMENT_STAGES } from "@/lib/constants/workflow";

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
