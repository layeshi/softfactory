import { beforeEach, expect, test } from "vitest";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createExecutionCommandRunner } from "@/lib/services/execution-command-service";

let sandboxRoot = "";

beforeEach(async () => {
  if (sandboxRoot) {
    await rm(sandboxRoot, { recursive: true, force: true });
  }
  sandboxRoot = await mkdtemp(join(tmpdir(), "softfactory-command-test-"));
});

test("exposes a real runner adapter with fixed claude command arguments", async () => {
  const runner = createExecutionCommandRunner({ mode: "real" });
  const command = runner.buildCommand({
    runId: "run-1",
    stageType: "design",
    runDirectory: join(sandboxRoot, "run-1"),
    worktreePath: sandboxRoot,
    taskPackagePath: join(sandboxRoot, "task.json"),
  });

  expect(runner.kind).toBe("real");
  expect(command.command).toBe("claude");
  expect(command.args).toContain("--print");
  expect(command.args).toContain("--output-format");
  expect(command.args).toContain("json");
});

test("writes deterministic fake runner outputs", async () => {
  const runner = createExecutionCommandRunner({ mode: "fake" });
  const result = await runner.executeStage({
    runId: "run-1",
    stageType: "design",
    runDirectory: join(sandboxRoot, "run-1"),
    worktreePath: sandboxRoot,
    taskPackagePath: join(sandboxRoot, "task.json"),
  });

  expect(result.summary).toContain("design completed");
  await expect(readFile(result.resultSnapshotPath, "utf8")).resolves.toContain(
    "\"stageType\": \"design\"",
  );
});
