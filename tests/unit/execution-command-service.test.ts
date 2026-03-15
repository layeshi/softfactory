import { chmod, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { beforeEach, expect, test } from "vitest";
let sandboxRoot = "";

beforeEach(async () => {
  delete process.env.SOFTFACTORY_CLAUDE_COMMAND;
  if (sandboxRoot) {
    await rm(sandboxRoot, { recursive: true, force: true });
  }
  sandboxRoot = await mkdtemp(join(tmpdir(), "softfactory-command-test-"));
});

test("exposes a real runner adapter with fixed claude command arguments", async () => {
  const { createExecutionCommandRunner } = await import(
    "@/lib/services/execution-command-service"
  );
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

test("uses spawn with ignored stdin for the real runner and writes outputs", async () => {
  const { createExecutionCommandRunner } = await import(
    "@/lib/services/execution-command-service"
  );
  const fakeClaudePath = join(sandboxRoot, "fake-claude.py");
  await writeFile(
    fakeClaudePath,
    [
      "#!/usr/bin/env python3",
      "import json",
      "import sys",
      "_ = sys.stdin.read()",
      'print(json.dumps({"type":"result","subtype":"success","result":"```json\\n{\\"status\\": \\"completed\\", \\"summary\\": \\"Structured design summary\\", \\"outcome\\": \\"success\\", \\"changes\\": [\\"Created design-summary.md\\"], \\"artifactsCreated\\": [\\"design-summary.md\\"]}\\n```"}))',
      "",
    ].join("\n"),
    "utf8",
  );
  await chmod(fakeClaudePath, 0o755);
  process.env.SOFTFACTORY_CLAUDE_COMMAND = fakeClaudePath;

  const runner = createExecutionCommandRunner({ mode: "real" });
  const runDirectory = join(sandboxRoot, "run-1");
  const result = await runner.executeStage({
    runId: "run-1",
    stageType: "design",
    runDirectory,
    worktreePath: sandboxRoot,
    taskPackagePath: join(sandboxRoot, "task.json"),
  });

  expect(result.summary).toBe("Structured design summary");
  expect(result.outcome).toBe("success");
  expect(result.changes).toEqual(["Created design-summary.md"]);
  expect(result.artifactsCreated).toEqual(["design-summary.md"]);
  await expect(readFile(result.stdoutPath, "utf8")).resolves.toContain("\"type\": \"result\"");
  await expect(readFile(result.resultSnapshotPath, "utf8")).resolves.toContain(
    "\"summary\": \"Structured design summary\"",
  );
}, 10000);

test("writes deterministic fake runner outputs", async () => {
  const { createExecutionCommandRunner } = await import(
    "@/lib/services/execution-command-service"
  );
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
