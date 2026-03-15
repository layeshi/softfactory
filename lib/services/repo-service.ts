import { access, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { ensureProjectDirectories } from "@/lib/services/workspace-service";

const execFileAsync = promisify(execFile);
const gitCommitEnv = {
  ...process.env,
  GIT_AUTHOR_NAME: process.env.GIT_AUTHOR_NAME ?? "Softfactory",
  GIT_AUTHOR_EMAIL: process.env.GIT_AUTHOR_EMAIL ?? "softfactory@example.com",
  GIT_COMMITTER_NAME: process.env.GIT_COMMITTER_NAME ?? "Softfactory",
  GIT_COMMITTER_EMAIL:
    process.env.GIT_COMMITTER_EMAIL ?? "softfactory@example.com",
};

async function hasGitDirectory(repoPath: string) {
  try {
    await access(join(repoPath, ".git"));
    return true;
  } catch {
    return false;
  }
}

async function hasHeadCommit(repoPath: string) {
  try {
    await execFileAsync("git", ["rev-parse", "HEAD"], {
      cwd: repoPath,
    });
    return true;
  } catch {
    return false;
  }
}

export async function ensureProjectRepo(projectSlug: string) {
  const directories = await ensureProjectDirectories(projectSlug);

  if (!(await hasGitDirectory(directories.repoDir))) {
    await execFileAsync("git", ["init"], {
      cwd: directories.repoDir,
    });
  }

  if (!(await hasHeadCommit(directories.repoDir))) {
    const readmePath = join(directories.repoDir, "README.md");
    await writeFile(
      readmePath,
      `# ${projectSlug}\n\nInitialized by Softfactory.\n`,
      "utf8",
    );
    await execFileAsync("git", ["add", "README.md"], {
      cwd: directories.repoDir,
    });
    await execFileAsync("git", ["commit", "-m", "chore: initialize project repo"], {
      cwd: directories.repoDir,
      env: gitCommitEnv,
    });
  }

  return {
    projectRoot: directories.projectRoot,
    repoPath: directories.repoDir,
    runsPath: directories.runsDir,
    artifactsPath: directories.artifactsDir,
    tempPath: directories.tempDir,
  };
}

type CreateExecutionWorktreeInput = {
  repoPath: string;
  worktreePath: string;
  branchName: string;
};

export async function createExecutionWorktree(input: CreateExecutionWorktreeInput) {
  try {
    await access(join(input.worktreePath, ".git"));
    return {
      worktreePath: input.worktreePath,
      branchName: input.branchName,
    };
  } catch {
    await execFileAsync(
      "git",
      ["worktree", "add", "-b", input.branchName, input.worktreePath, "HEAD"],
      {
        cwd: input.repoPath,
      },
    );
  }

  return {
    worktreePath: input.worktreePath,
    branchName: input.branchName,
  };
}
