import { vi } from "vitest";
import { render, screen } from "@testing-library/react";
import HomePage from "@/app/page";

vi.mock("@/lib/i18n/get-locale", () => ({
  defaultLocale: "zh",
  getRequestLocale: vi.fn().mockResolvedValue("zh"),
}));

vi.mock("@/lib/services/dashboard-service", () => ({
  getDashboardSummary: vi.fn().mockResolvedValue({
    projectCount: 2,
    pendingApprovals: 1,
    inProgressProjects: 1,
    blockedProjects: 0,
    recentChanges: [{ id: "1" }],
  }),
}));

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(() => ({
    refresh: vi.fn(),
  })),
}));

test("renders the dashboard heading", async () => {
  render(await HomePage());
  expect(
    screen.getByRole("heading", { name: /软件工厂/i, level: 2 }),
  ).toBeInTheDocument();
});
