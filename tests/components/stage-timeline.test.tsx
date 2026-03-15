import React from "react";
import { render, screen } from "@testing-library/react";
import { StageTimeline } from "@/components/requirements/stage-timeline";

test("renders the five standard engineering stages in order", () => {
  render(
    <StageTimeline
      labels={{
        stage: {
          requirement: "需求",
          design: "设计",
          development: "开发",
          test: "测试",
          approval: "审批",
        },
        status: {
          completed: "已完成",
          pending_confirmation: "待确认",
          not_started: "未开始",
        },
      }}
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
