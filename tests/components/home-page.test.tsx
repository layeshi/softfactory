import React from "react";
import { render, screen } from "@testing-library/react";
import HomePage from "@/app/page";

test("renders the dashboard heading", () => {
  render(<HomePage />);
  expect(
    screen.getByRole("heading", { name: /software factory/i, level: 2 }),
  ).toBeInTheDocument();
});
