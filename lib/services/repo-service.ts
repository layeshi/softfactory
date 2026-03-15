import { access } from "node:fs/promises";
import { join } from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { ensureProjectDirectories } from "@/lib/services/workspace-service";

const execFileAsync = promisify(execFile);

async function hasGitDirectory(repoPath: string) {
  try {
    await access(join(repoPath, ".git"));
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

  return {
    projectRoot: directories.projectRoot,
    repoPath: directories.repoDir,
    runsPath: directories.runsDir,
    artifactsPath: directories.artifactsDir,
    tempPath: directories.tempDir,
  };
}
