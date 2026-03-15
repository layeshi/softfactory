import React from "react";
import { render, screen } from "@testing-library/react";
import { RunStageTimeline } from "@/components/execution/run-stage-timeline";

test("renders run stages and statuses", () => {
  render(
    <RunStageTimeline
      labels={{
        stage: {
          design: "设计",
          development: "开发",
          test: "测试",
        },
        status: {
          succeeded: "已完成",
          waiting_for_decision: "待确认",
        },
        logs: "日志",
        result: "结果",
      }}
      stageRuns={[
        {
          id: "1",
          stageType: "design",
          status: "succeeded",
          stdoutPath: "/tmp/design.stdout.log",
          resultSnapshotPath: "/tmp/design.result.json",
        },
        {
          id: "2",
          stageType: "development",
          status: "waiting_for_decision",
          stdoutPath: "/tmp/development.stdout.log",
          resultSnapshotPath: "/tmp/development.result.json",
        },
      ]}
    />,
  );

  expect(screen.getByText("设计")).toBeInTheDocument();
  expect(screen.getByText("开发")).toBeInTheDocument();
  expect(screen.getByText("待确认")).toBeInTheDocument();
});
