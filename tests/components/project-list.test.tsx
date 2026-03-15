import React from "react";
import { render, screen } from "@testing-library/react";
import { ProjectList } from "@/components/projects/project-list";

test("renders project status badges", () => {
  render(
    <ProjectList
      locale="zh"
      labels={{
        emptyTitle: "还没有项目",
        emptyDescription: "创建第一个项目，开始跟踪需求、文档和审批。",
        project: "项目",
        goal: "目标",
        requirements: "需求数",
        updated: "更新时间",
      }}
      statusLabels={{
        blocked: "阻塞",
      }}
      projects={[
        {
          id: "1",
          name: "Alpha",
          slug: "alpha",
          summary: "Alpha summary",
          goal: "Ship MVP",
          status: "blocked",
          requirementCount: 2,
          updatedAt: "2026-03-15",
        },
      ]}
    />,
  );

  expect(screen.getByText("阻塞")).toBeInTheDocument();
});
