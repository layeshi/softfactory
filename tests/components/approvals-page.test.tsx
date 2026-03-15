import { vi } from "vitest";
import { render, screen } from "@testing-library/react";
import ApprovalsPage from "@/app/approvals/page";

vi.mock("@/lib/i18n/get-locale", () => ({
  defaultLocale: "zh",
  getRequestLocale: vi.fn().mockResolvedValue("zh"),
}));

vi.mock("@/lib/db", () => ({
  prisma: {
    approval: {
      findMany: vi.fn().mockResolvedValue([]),
    },
    executionDecision: {
      findMany: vi.fn().mockResolvedValue([
        {
          id: "decision-1",
          decisionType: "design_review",
          status: "pending",
          comment: null,
          createdAt: new Date().toISOString(),
        },
      ]),
    },
  },
}));

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(() => ({
    refresh: vi.fn(),
  })),
}));

test("shows approve and reject actions for pending execution decisions", async () => {
  render(await ApprovalsPage());

  expect(screen.getByRole("button", { name: "批准" })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "驳回" })).toBeInTheDocument();
});
