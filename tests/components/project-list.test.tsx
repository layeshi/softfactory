import React from "react";
import { render, screen } from "@testing-library/react";
import { ProjectList } from "@/components/projects/project-list";

test("renders project status badges", () => {
  render(
    <ProjectList
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

  expect(screen.getByText(/blocked/i)).toBeInTheDocument();
});
