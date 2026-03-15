import React from "react";
import { render, screen } from "@testing-library/react";
import { StageTimeline } from "@/components/requirements/stage-timeline";

test("renders the five standard engineering stages in order", () => {
  render(
    <StageTimeline
      stages={[
        { stageType: "requirement", status: "completed" },
        { stageType: "design", status: "pending_confirmation" },
        { stageType: "development", status: "not_started" },
        { stageType: "test", status: "not_started" },
        { stageType: "approval", status: "not_started" },
      ]}
    />,
  );

  expect(screen.getAllByRole("listitem")).toHaveLength(5);
});
