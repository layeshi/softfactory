import { access, rm } from "node:fs/promises";
import { join } from "node:path";
import { beforeEach, expect, test } from "vitest";
import { ensureProjectRepo } from "@/lib/services/repo-service";
import { getWorkspaceRoot } from "@/lib/services/workspace-service";

const projectSlug = "demo-project";
const projectRoot = join(getWorkspaceRoot(), "projects", projectSlug);

beforeEach(async () => {
  await rm(projectRoot, { recursive: true, force: true });
});

test("creates a repo directory and initializes git", async () => {
  const result = await ensureProjectRepo(projectSlug);

  expect(result.repoPath).toContain("/projects/demo-project/repo");
  await expect(access(join(result.repoPath, ".git"))).resolves.toBeUndefined();
});
