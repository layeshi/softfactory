import { access, rm } from "node:fs/promises";
import { execFile } from "node:child_process";
import { join } from "node:path";
import { promisify } from "node:util";
import { beforeEach, expect, test } from "vitest";
import { createExecutionWorktree, ensureProjectRepo } from "@/lib/services/repo-service";
import { getWorkspaceRoot } from "@/lib/services/workspace-service";

const projectSlug = "demo-project";
const projectRoot = join(getWorkspaceRoot(), "projects", projectSlug);
const execFileAsync = promisify(execFile);

beforeEach(async () => {
  await rm(projectRoot, { recursive: true, force: true });
});

test("creates a repo directory and initializes git", async () => {
  const result = await ensureProjectRepo(projectSlug);

  expect(result.repoPath).toContain("/projects/demo-project/repo");
  await expect(access(join(result.repoPath, ".git"))).resolves.toBeUndefined();
  await expect(execFileAsync("git", ["rev-parse", "HEAD"], { cwd: result.repoPath })).resolves.toMatchObject({
    stdout: expect.stringMatching(/[a-f0-9]{40}/),
  });
});

test("creates an isolated worktree for an execution run", async () => {
  const result = await ensureProjectRepo(projectSlug);
  const worktreePath = join(result.tempPath, "run-demo");
  const worktree = await createExecutionWorktree({
    repoPath: result.repoPath,
    worktreePath,
    branchName: "run-demo",
  });

  expect(worktree.worktreePath).toBe(worktreePath);
  await expect(access(join(worktree.worktreePath, ".git"))).resolves.toBeUndefined();
  await expect(
    execFileAsync("git", ["branch", "--show-current"], { cwd: worktree.worktreePath }),
  ).resolves.toMatchObject({
    stdout: "run-demo\n",
  });
});
