import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

export type ExecutionCommandResult = {
  stdoutPath: string;
  stderrPath: string;
  resultSnapshotPath: string;
  artifactPath: string;
  summary: string;
};

type ExecuteStageCommandInput = {
  runId: string;
  stageType: string;
  runDirectory: string;
  worktreePath: string;
};

export function createExecutionCommandRunner(options?: { mode?: "fake" | "real" }) {
  const mode =
    options?.mode ??
    (process.env.SOFTFACTORY_EXECUTION_RUNNER === "real" ? "real" : "fake");

  return {
    kind: mode,
    async executeStage(input: ExecuteStageCommandInput) {
      if (mode === "real") {
        throw new Error("Real execution runner is not configured yet");
      }

      const artifactDirectory = join(input.runDirectory, "artifacts");
      const stdoutPath = join(input.runDirectory, `${input.stageType}.stdout.log`);
      const stderrPath = join(input.runDirectory, `${input.stageType}.stderr.log`);
      const resultSnapshotPath = join(
        input.runDirectory,
        `${input.stageType}.result.json`,
      );
      const artifactPath = join(artifactDirectory, `${input.stageType}-summary.md`);
      const summary = `${input.stageType} completed for run ${input.runId}`;

      await mkdir(input.worktreePath, { recursive: true });
      await mkdir(artifactDirectory, { recursive: true });
      await writeFile(
        stdoutPath,
        `[fake-runner] ${input.stageType} succeeded in ${input.worktreePath}\n`,
        "utf8",
      );
      await writeFile(stderrPath, "", "utf8");
      await writeFile(
        resultSnapshotPath,
        JSON.stringify(
          {
            runId: input.runId,
            stageType: input.stageType,
            summary,
          },
          null,
          2,
        ),
        "utf8",
      );
      await writeFile(
        artifactPath,
        `# ${input.stageType}\n\n${summary}\n`,
        "utf8",
      );

      return {
        stdoutPath,
        stderrPath,
        resultSnapshotPath,
        artifactPath,
        summary,
      } satisfies ExecutionCommandResult;
    },
  };
}
