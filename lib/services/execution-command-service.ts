import { access, mkdir, writeFile } from "node:fs/promises";
import { execFile } from "node:child_process";
import { join } from "node:path";
import { promisify } from "node:util";

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
  taskPackagePath: string;
};

export type ExecutionCommand = {
  command: string;
  args: string[];
};

const execFileAsync = promisify(execFile);

function buildExecutionPrompt(input: ExecuteStageCommandInput) {
  return [
    `You are executing the ${input.stageType} stage for run ${input.runId}.`,
    `Read the task package at ${input.taskPackagePath}.`,
    `Work only inside the current working directory.`,
    "Produce a concise result summary and, if relevant, update files in the workspace.",
    "Return a short JSON-friendly response describing what you changed and the key outcome.",
  ].join(" ");
}

async function ensureArtifactFile(path: string, content: string) {
  try {
    await access(path);
  } catch {
    await writeFile(path, content, "utf8");
  }
}

export function createExecutionCommandRunner(options?: { mode?: "fake" | "real" }) {
  const mode =
    options?.mode ??
    (process.env.SOFTFACTORY_EXECUTION_RUNNER === "real" ? "real" : "fake");

  return {
    kind: mode,
    buildCommand(input: ExecuteStageCommandInput): ExecutionCommand {
      return {
        command: "claude",
        args: [
          "--print",
          "--output-format",
          "json",
          "--dangerously-skip-permissions",
          buildExecutionPrompt(input),
        ],
      };
    },
    async executeStage(input: ExecuteStageCommandInput) {
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

      if (mode === "real") {
        const command = this.buildCommand(input);
        const { stdout, stderr } = await execFileAsync(command.command, command.args, {
          cwd: input.worktreePath,
          env: process.env,
          maxBuffer: 10 * 1024 * 1024,
        });

        await writeFile(stdoutPath, stdout, "utf8");
        await writeFile(stderrPath, stderr, "utf8");
        await writeFile(
          resultSnapshotPath,
          JSON.stringify(
            {
              runId: input.runId,
              stageType: input.stageType,
              rawOutput: stdout,
            },
            null,
            2,
          ),
          "utf8",
        );

        const parsedSummary = stdout.trim() || summary;
        await ensureArtifactFile(
          artifactPath,
          `# ${input.stageType}\n\n${parsedSummary}\n`,
        );

        return {
          stdoutPath,
          stderrPath,
          resultSnapshotPath,
          artifactPath,
          summary: parsedSummary,
        } satisfies ExecutionCommandResult;
      }

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
            taskPackagePath: input.taskPackagePath,
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
