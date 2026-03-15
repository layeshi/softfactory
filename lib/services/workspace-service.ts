import { mkdir } from "node:fs/promises";
import { join } from "node:path";

const workspaceRoot = process.env.SOFTFACTORY_WORKSPACE_ROOT ?? "/tmp/softfactory-workspace";

export function getWorkspaceRoot() {
  return workspaceRoot;
}

export async function ensureProjectDirectories(projectSlug: string) {
  const projectRoot = join(workspaceRoot, "projects", projectSlug);
  const repoDir = join(projectRoot, "repo");
  const runsDir = join(projectRoot, "runs");
  const artifactsDir = join(projectRoot, "artifacts");
  const tempDir = join(projectRoot, "temp");
  const requirementDir = join(
    projectRoot,
    "docs",
    "requirements",
  );
  const designDir = join(projectRoot, "docs", "designs");
  const testDir = join(projectRoot, "docs", "tests");

  await Promise.all([
    mkdir(repoDir, { recursive: true }),
    mkdir(runsDir, { recursive: true }),
    mkdir(artifactsDir, { recursive: true }),
    mkdir(tempDir, { recursive: true }),
    mkdir(requirementDir, { recursive: true }),
    mkdir(designDir, { recursive: true }),
    mkdir(testDir, { recursive: true }),
  ]);

  return {
    projectRoot,
    repoDir,
    runsDir,
    artifactsDir,
    tempDir,
    requirementDir,
    designDir,
    testDir,
  };
}
