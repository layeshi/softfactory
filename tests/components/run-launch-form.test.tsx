import React from "react";
import { render, screen } from "@testing-library/react";
import { RunLaunchForm } from "@/components/execution/run-launch-form";

test("renders run type and execution mode controls", () => {
  render(
    <RunLaunchForm
      action={async () => {}}
      labels={{
        runType: "Run Type",
        executionMode: "Execution Mode",
        targetStage: "Target Stage",
        submit: "Start Run",
        runTypes: {
          full_run: "Full Run",
          stage_run: "Stage Run",
        },
        executionModes: {
          manual_gate: "Manual Gate",
          auto_flow: "Auto Flow",
        },
        stages: {
          design: "Design",
          development: "Development",
          test: "Test",
        },
      }}
    />,
  );

  expect(screen.getByLabelText(/run type/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/execution mode/i)).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /start run/i })).toBeInTheDocument();
});
