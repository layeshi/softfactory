import { render, screen } from "@testing-library/react";
import HomePage from "@/app/page";

test("renders the dashboard heading", async () => {
  render(await HomePage());
  expect(
    screen.getByRole("heading", { name: /software factory/i, level: 2 }),
  ).toBeInTheDocument();
});
