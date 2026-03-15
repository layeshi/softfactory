import React from "react";
import { render, screen } from "@testing-library/react";
import { SidebarNav } from "@/components/layout/sidebar-nav";

test("renders Chinese nav labels", () => {
  render(
    <SidebarNav
      labels={{
        brandKicker: "Softfactory",
        brandTitle: "软件工厂",
        brandDescription: "面向需求驱动交付的本地控制台。",
        nav: {
          dashboard: "仪表盘",
          projects: "项目",
          documents: "文档",
          approvals: "审批",
        },
      }}
    />,
  );

  expect(screen.getByText("仪表盘")).toBeInTheDocument();
});
