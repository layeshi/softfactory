import { vi } from "vitest";
import { render, screen } from "@testing-library/react";
import RunDetailPage from "@/app/runs/[runId]/page";

vi.mock("@/lib/i18n/get-locale", () => ({
  defaultLocale: "en",
  getRequestLocale: vi.fn().mockResolvedValue("en"),
}));

vi.mock("@/lib/services/execution-service", () => ({
  getExecutionRunDetail: vi.fn().mockResolvedValue({
    id: "run-1",
    runType: "full_run",
    executionMode: "manual_gate",
    status: "waiting_for_decision",
    currentStage: "design",
    taskPackagePath: "/tmp/task.json",
    worktreePath: "/tmp/worktree",
    project: {
      id: "project-1",
      name: "Execution Factory",
      summary: "Execution summary",
      goal: "Ship phase 2",
      slug: "execution-factory",
      status: "in_progress",
      updatedAt: new Date().toISOString(),
    },
    requirement: {
      id: "req-1",
      title: "Build run detail",
      normalizedDescription: "Show run details in the UI.",
    },
    stageRuns: [
      {
        id: "stage-1",
        stageType: "design",
        status: "waiting_for_decision",
        stdoutPath: "/tmp/design.stdout.log",
        resultSnapshotPath: "/tmp/design.result.json",
      },
    ],
    artifacts: [
      {
        id: "artifact-1",
        title: "Design summary",
        artifactType: "design_summary",
        filePath: "/tmp/design-summary.md",
        summary: "Created a design summary.",
      },
    ],
    decisions: [
      {
        id: "decision-1",
        decisionType: "design_review",
        status: "pending",
        comment: null,
        createdAt: new Date().toISOString(),
      },
    ],
  }),
}));

vi.mock("next/navigation", () => ({
  notFound: vi.fn(),
  useRouter: vi.fn(() => ({
    refresh: vi.fn(),
  })),
}));

test("shows run summary and stage results", async () => {
  render(await RunDetailPage({ params: Promise.resolve({ runId: "run-1" }) }));

  expect(screen.getByText(/manual gate/i)).toBeInTheDocument();
  expect(screen.getByText("Design summary")).toBeInTheDocument();
  expect(screen.getByText(/created a design summary/i)).toBeInTheDocument();
});
