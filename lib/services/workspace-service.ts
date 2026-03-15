import { mkdir } from "node:fs/promises";
import { join } from "node:path";

const workspaceRoot = process.env.SOFTFACTORY_WORKSPACE_ROOT ?? "/tmp/softfactory-workspace";

export function getWorkspaceRoot() {
  return workspaceRoot;
}

export async function ensureProjectDirectories(projectSlug: string) {
  const requirementDir = join(
    workspaceRoot,
    "projects",
    projectSlug,
    "docs",
    "requirements",
  );
  const designDir = join(workspaceRoot, "projects", projectSlug, "docs", "designs");
  const testDir = join(workspaceRoot, "projects", projectSlug, "docs", "tests");

  await Promise.all([
    mkdir(requirementDir, { recursive: true }),
    mkdir(designDir, { recursive: true }),
    mkdir(testDir, { recursive: true }),
  ]);

  return {
    requirementDir,
    designDir,
    testDir,
  };
}
