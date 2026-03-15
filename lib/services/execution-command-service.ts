import { access, mkdir, writeFile } from "node:fs/promises";
import { spawn } from "node:child_process";
import { join } from "node:path";

export type ExecutionCommandResult = {
  stdoutPath: string;
  stderrPath: string;
  resultSnapshotPath: string;
  artifactPath: string;
  summary: string;
  outcome?: string;
  changes: string[];
  artifactsCreated: string[];
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

type ParsedExecutionPayload = {
  summary: string;
  outcome?: string;
  changes: string[];
  artifactsCreated: string[];
};

function parseExecutionPayload(value: string, fallback: string): ParsedExecutionPayload {
  const trimmed = value.trim();
  const fencedJsonMatch = trimmed.match(/```json\s*([\s\S]*?)\s*```/i);
  const candidate = fencedJsonMatch?.[1]?.trim() ?? trimmed;

  try {
    const parsed = JSON.parse(candidate) as {
      summary?: string;
      outcome?: string;
      changes?: string[];
      artifactsCreated?: string[];
      status?: string;
    };

    return {
      summary:
        typeof parsed.summary === "string" && parsed.summary.trim()
          ? parsed.summary.trim()
          : fallback,
      outcome:
        typeof parsed.outcome === "string"
          ? parsed.outcome
          : typeof parsed.status === "string"
            ? parsed.status
            : undefined,
      changes: Array.isArray(parsed.changes)
        ? parsed.changes.filter((item): item is string => typeof item === "string")
        : [],
      artifactsCreated: Array.isArray(parsed.artifactsCreated)
        ? parsed.artifactsCreated.filter(
            (item): item is string => typeof item === "string",
          )
        : [],
    };
  } catch {
    return {
      summary: trimmed || fallback,
      outcome: undefined,
      changes: [],
      artifactsCreated: [],
    };
  }
}

function parseResultOutput(stdout: string, fallback: string): ParsedExecutionPayload {
  const trimmed = stdout.trim();

  if (!trimmed) {
    return {
      summary: fallback,
      outcome: undefined,
      changes: [],
      artifactsCreated: [],
    };
  }

  try {
    const parsed = JSON.parse(trimmed) as { result?: string };
    if (typeof parsed.result === "string" && parsed.result.trim()) {
      return parseExecutionPayload(parsed.result, fallback);
    }
  } catch {
    return parseExecutionPayload(trimmed, fallback);
  }

  return {
    summary: trimmed,
    outcome: undefined,
    changes: [],
    artifactsCreated: [],
  };
}

function executeRealCommand(command: ExecutionCommand, cwd: string) {
  return new Promise<{ stdout: string; stderr: string }>((resolve, reject) => {
    const child = spawn(command.command, command.args, {
      cwd,
      env: process.env,
      stdio: ["ignore", "pipe", "pipe"],
    });
    const timeoutMs = Number(process.env.SOFTFACTORY_EXECUTION_TIMEOUT_MS ?? "120000");
    let stdout = "";
    let stderr = "";
    let settled = false;

    const finalize = (callback: () => void) => {
      if (settled) {
        return;
      }

      settled = true;
      clearTimeout(timeoutHandle);
      callback();
    };

    const timeoutHandle = setTimeout(() => {
      child.kill("SIGTERM");
      finalize(() => {
        reject(new Error(`Execution command timed out after ${timeoutMs}ms`));
      });
    }, timeoutMs);

    child.stdout?.on("data", (chunk: Buffer | string) => {
      stdout += chunk.toString();
    });
    child.stderr?.on("data", (chunk: Buffer | string) => {
      stderr += chunk.toString();
    });
    child.on("error", (error) => {
      finalize(() => reject(error));
    });
    child.on("close", (code) => {
      finalize(() => {
        if (code === 0) {
          resolve({ stdout, stderr });
          return;
        }

        reject(
          new Error(
            `Execution command failed with exit code ${code ?? "unknown"}${stderr ? `: ${stderr}` : ""}`,
          ),
        );
      });
    });
  });
}

export function createExecutionCommandRunner(options?: { mode?: "fake" | "real" }) {
  const mode =
    options?.mode ??
    (process.env.SOFTFACTORY_EXECUTION_RUNNER === "real" ? "real" : "fake");

  return {
    kind: mode,
    buildCommand(input: ExecuteStageCommandInput): ExecutionCommand {
      return {
        command: process.env.SOFTFACTORY_CLAUDE_COMMAND ?? "claude",
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

      await mkdir(input.runDirectory, { recursive: true });
      await mkdir(input.worktreePath, { recursive: true });
      await mkdir(artifactDirectory, { recursive: true });

      if (mode === "real") {
        const command = this.buildCommand(input);
        const { stdout, stderr } = await executeRealCommand(
          command,
          input.worktreePath,
        );

        await writeFile(stdoutPath, stdout, "utf8");
        await writeFile(stderrPath, stderr, "utf8");
        const parsedResult = parseResultOutput(stdout, summary);
        await writeFile(
          resultSnapshotPath,
          JSON.stringify(
            {
              runId: input.runId,
              stageType: input.stageType,
              rawOutput: stdout,
              summary: parsedResult.summary,
              outcome: parsedResult.outcome,
              changes: parsedResult.changes,
              artifactsCreated: parsedResult.artifactsCreated,
            },
            null,
            2,
          ),
          "utf8",
        );

        const parsedSummary = parsedResult.summary;
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
          outcome: parsedResult.outcome,
          changes: parsedResult.changes,
          artifactsCreated: parsedResult.artifactsCreated,
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
        outcome: "success",
        changes: [],
        artifactsCreated: [`${input.stageType}-summary.md`],
      } satisfies ExecutionCommandResult;
    },
  };
}
