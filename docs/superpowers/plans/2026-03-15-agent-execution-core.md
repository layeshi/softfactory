# Agent Execution Core Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a real local execution core that creates project workspaces and repos, launches requirement runs, stores task packages and run history, and supports manual-gate or auto-flow execution for design, development, and test stages.

**Architecture:** Extend the existing Next.js + Prisma monolith with a dedicated execution domain, a local worker entrypoint, workspace/repo provisioning, and requirement-centric execution UI. The UI creates and reviews runs; a worker claims queued runs, provisions isolated environments, writes task packages, invokes a command runner, captures logs/artifacts, and advances run state.

**Tech Stack:** Next.js 15, React 19, TypeScript, Prisma, SQLite, Node.js filesystem/process APIs, Vitest, React Testing Library

---

## File Structure

### Existing files to modify

- `prisma/schema.prisma`
- `prisma/seed.ts`
- `package.json`
- `README.md`
- `lib/constants/workflow.ts`
- `lib/services/project-service.ts`
- `lib/services/requirement-service.ts`
- `lib/services/document-service.ts`
- `lib/services/workspace-service.ts`
- `lib/services/dashboard-service.ts`
- `lib/i18n/messages.ts`
- `lib/utils.ts`
- `app/projects/[projectId]/page.tsx`
- `app/projects/[projectId]/requirements/[requirementId]/page.tsx`
- `app/approvals/page.tsx`
- `components/approvals/approval-list.tsx`
- `app/globals.css`

### New execution domain files

- `lib/validators/execution-run.ts`
- `lib/services/execution-service.ts`
- `lib/services/execution-worker-service.ts`
- `lib/services/execution-package-service.ts`
- `lib/services/execution-command-service.ts`
- `lib/services/repo-service.ts`
- `lib/services/execution-decision-service.ts`
- `lib/services/execution-artifact-service.ts`
- `lib/services/execution-stage-service.ts`
- `lib/services/execution-run-query-service.ts`

### New worker/runtime files

- `scripts/run-worker.ts`

### New UI files

- `app/runs/[runId]/page.tsx`
- `components/execution/run-launch-form.tsx`
- `components/execution/run-history-list.tsx`
- `components/execution/run-stage-timeline.tsx`
- `components/execution/run-detail-panel.tsx`
- `components/execution/execution-decision-list.tsx`

### New tests

- `tests/unit/repo-service.test.ts`
- `tests/unit/execution-service.test.ts`
- `tests/unit/execution-package-service.test.ts`
- `tests/unit/execution-worker-service.test.ts`
- `tests/unit/execution-decision-service.test.ts`
- `tests/components/run-launch-form.test.tsx`
- `tests/components/run-stage-timeline.test.tsx`
- `tests/components/run-detail-page.test.tsx`

## Chunk 1: Execution Domain Foundation

### Task 1: Add execution workflow constants and Prisma schema

**Files:**
- Modify: `lib/constants/workflow.ts`
- Modify: `prisma/schema.prisma`
- Modify: `prisma/seed.ts`
- Test: `tests/unit/workflow.test.ts`

- [ ] **Step 1: Extend the failing workflow test**

```ts
import {
  EXECUTION_MODES,
  EXECUTION_RUN_STATUSES,
  EXECUTION_STAGE_RUN_STATUSES,
  EXECUTION_RUN_TYPES,
} from "@/lib/constants/workflow";

test("defines supported execution modes", () => {
  expect(EXECUTION_MODES).toEqual(["manual_gate", "auto_flow"]);
});

test("defines supported run types", () => {
  expect(EXECUTION_RUN_TYPES).toEqual(["full_run", "stage_run"]);
});
```

- [ ] **Step 2: Run the targeted test to verify it fails**

Run: `DATABASE_URL=file:/tmp/softfactory-dev.db npm run test -- tests/unit/workflow.test.ts --run`
Expected: FAIL because the constants do not exist yet

- [ ] **Step 3: Add execution constants**

Implement in `lib/constants/workflow.ts`:

```ts
export const EXECUTION_RUN_TYPES = ["full_run", "stage_run"] as const;
export const EXECUTION_MODES = ["manual_gate", "auto_flow"] as const;
export const EXECUTION_RUN_STATUSES = [
  "queued",
  "preparing",
  "running",
  "waiting_for_decision",
  "succeeded",
  "failed",
  "cancelled",
] as const;
export const EXECUTION_STAGE_RUN_STATUSES = [
  "pending",
  "running",
  "waiting_for_decision",
  "succeeded",
  "failed",
  "skipped",
] as const;
```

Add new Prisma models:
- `ExecutionRun`
- `ExecutionStageRun`
- `ExecutionArtifact`
- `ExecutionDecision`

Seed a small run history fixture that does not change existing dashboard assumptions.

- [ ] **Step 4: Apply the schema update locally**

Run: `DATABASE_URL=file:/tmp/softfactory-phase2-dev.db npx prisma db push`
Expected: PASS or the known local Prisma schema-engine failure must be documented before continuing

- [ ] **Step 5: Regenerate Prisma client**

Run: `npm run prisma:generate`
Expected: PASS

- [ ] **Step 6: Run targeted tests**

Run: `DATABASE_URL=file:/tmp/softfactory-dev.db npm run test -- tests/unit/workflow.test.ts --run`
Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add lib/constants/workflow.ts prisma/schema.prisma prisma/seed.ts tests/unit/workflow.test.ts
git commit -m "feat: add execution domain schema"
```

### Task 2: Add execution validators and core run creation service

**Files:**
- Create: `lib/validators/execution-run.ts`
- Create: `lib/services/execution-service.ts`
- Create: `lib/services/execution-run-query-service.ts`
- Modify: `lib/services/requirement-service.ts`
- Test: `tests/unit/execution-service.test.ts`

- [ ] **Step 1: Write the failing execution service test**

```ts
import { createExecutionRun } from "@/lib/services/execution-service";

test("creates a queued manual-gate run for a requirement", async () => {
  const run = await createExecutionRun({
    requirementId: seededRequirement.id,
    runType: "full_run",
    executionMode: "manual_gate",
  });

  expect(run.status).toBe("queued");
  expect(run.currentStage).toBe("design");
});
```

- [ ] **Step 2: Run the targeted test to verify it fails**

Run: `DATABASE_URL=file:/tmp/softfactory-dev.db npm run test -- tests/unit/execution-service.test.ts --run`
Expected: FAIL because the service does not exist yet

- [ ] **Step 3: Implement run validation and creation**

Add:
- Zod schema validating `runType`, `executionMode`, and optional `targetStage`
- logic for `full_run` stage resolution from requirement stage state
- logic for `stage_run` target validation
- persistence of `ExecutionRun` in `queued`

Return enough related fields for UI display.

- [ ] **Step 4: Add query helpers**

Implement query helpers to:
- list runs by requirement
- get run detail by id
- include stage runs, decisions, and artifacts in sorted order

- [ ] **Step 5: Run targeted tests**

Run: `DATABASE_URL=file:/tmp/softfactory-dev.db npm run test -- tests/unit/execution-service.test.ts --run`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add lib/validators/execution-run.ts lib/services/execution-service.ts lib/services/execution-run-query-service.ts lib/services/requirement-service.ts tests/unit/execution-service.test.ts
git commit -m "feat: add execution run creation services"
```

## Chunk 2: Workspace and Repo Provisioning

### Task 3: Expand workspace creation and initialize project repos

**Files:**
- Modify: `lib/services/workspace-service.ts`
- Create: `lib/services/repo-service.ts`
- Modify: `lib/services/project-service.ts`
- Test: `tests/unit/repo-service.test.ts`
- Test: `tests/unit/project-service.test.ts`

- [ ] **Step 1: Write the failing repo service test**

```ts
import { ensureProjectRepo } from "@/lib/services/repo-service";

test("creates a repo directory and initializes git", async () => {
  const result = await ensureProjectRepo("demo-project");
  expect(result.repoPath).toContain("/projects/demo-project/repo");
});
```

- [ ] **Step 2: Run the targeted test to verify it fails**

Run: `DATABASE_URL=file:/tmp/softfactory-dev.db npm run test -- tests/unit/repo-service.test.ts --run`
Expected: FAIL because the repo service does not exist yet

- [ ] **Step 3: Implement repo provisioning**

Update `lib/services/workspace-service.ts` to create:
- `repo/`
- `runs/`
- `artifacts/`
- `temp/`
- existing document directories

Add `lib/services/repo-service.ts` to:
- ensure the repo path exists
- run `git init` once
- return repo metadata paths

Update `createProject()` to provision the workspace and repo after the project row is created.

- [ ] **Step 4: Run targeted tests**

Run: `DATABASE_URL=file:/tmp/softfactory-dev.db npm run test -- tests/unit/repo-service.test.ts tests/unit/project-service.test.ts --run`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add lib/services/workspace-service.ts lib/services/repo-service.ts lib/services/project-service.ts tests/unit/repo-service.test.ts tests/unit/project-service.test.ts
git commit -m "feat: provision project workspaces and repos"
```

## Chunk 3: Task Packages and Worker State Machine

### Task 4: Implement task package generation

**Files:**
- Create: `lib/services/execution-package-service.ts`
- Create: `lib/services/execution-stage-service.ts`
- Modify: `lib/services/document-service.ts`
- Test: `tests/unit/execution-package-service.test.ts`

- [ ] **Step 1: Write the failing task package test**

```ts
import { buildExecutionTaskPackage } from "@/lib/services/execution-package-service";

test("builds a task package with workflow and output contract", async () => {
  const taskPackage = await buildExecutionTaskPackage(seededRun.id);
  expect(taskPackage.run.executionMode).toBe("manual_gate");
  expect(taskPackage.workflow.stagesToRun).toEqual(["design", "development", "test"]);
});
```

- [ ] **Step 2: Run the targeted test to verify it fails**

Run: `DATABASE_URL=file:/tmp/softfactory-dev.db npm run test -- tests/unit/execution-package-service.test.ts --run`
Expected: FAIL because the package builder does not exist yet

- [ ] **Step 3: Implement task package assembly**

Include:
- run metadata
- project workspace/repo paths
- requirement details
- related document paths
- decision stages derived from execution mode
- output contract for stage artifacts and generated docs

Persist `task.json` under the run directory and store the path on the run.

- [ ] **Step 4: Run targeted tests**

Run: `DATABASE_URL=file:/tmp/softfactory-dev.db npm run test -- tests/unit/execution-package-service.test.ts --run`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add lib/services/execution-package-service.ts lib/services/execution-stage-service.ts lib/services/document-service.ts tests/unit/execution-package-service.test.ts
git commit -m "feat: add execution task package generation"
```

### Task 5: Add worker claim/advance logic with a fake command runner

**Files:**
- Create: `lib/services/execution-worker-service.ts`
- Create: `lib/services/execution-command-service.ts`
- Create: `lib/services/execution-artifact-service.ts`
- Create: `lib/services/execution-decision-service.ts`
- Create: `scripts/run-worker.ts`
- Test: `tests/unit/execution-worker-service.test.ts`
- Test: `tests/unit/execution-decision-service.test.ts`

- [ ] **Step 1: Write the failing worker test**

```ts
import { processNextExecutionRun } from "@/lib/services/execution-worker-service";

test("processes a queued auto-flow run to success with the fake runner", async () => {
  const result = await processNextExecutionRun();
  expect(result?.status).toBe("succeeded");
});
```

- [ ] **Step 2: Run the targeted test to verify it fails**

Run: `DATABASE_URL=file:/tmp/softfactory-dev.db npm run test -- tests/unit/execution-worker-service.test.ts --run`
Expected: FAIL because the worker service does not exist yet

- [ ] **Step 3: Implement a fake runner first**

Create a command service with two modes:
- fake runner for tests and local safe integration
- real runner placeholder that is not yet wired

The fake runner should write deterministic stdout/stderr/result files per stage.

- [ ] **Step 4: Implement worker orchestration**

Worker responsibilities:
- claim one queued run
- set status to `preparing`
- ensure run directory exists
- create a stage run
- write snapshots
- execute the fake runner
- persist logs and artifacts
- move to `waiting_for_decision` or next stage or `succeeded`

- [ ] **Step 5: Implement decision recording**

Support:
- approving a waiting stage
- rejecting a waiting stage
- continuing the run after approval

- [ ] **Step 6: Add worker entry script**

Add `scripts/run-worker.ts` and package script:

```json
{
  "scripts": {
    "worker": "tsx scripts/run-worker.ts"
  }
}
```

- [ ] **Step 7: Run targeted tests**

Run: `DATABASE_URL=file:/tmp/softfactory-dev.db npm run test -- tests/unit/execution-worker-service.test.ts tests/unit/execution-decision-service.test.ts --run`
Expected: PASS

- [ ] **Step 8: Commit**

```bash
git add lib/services/execution-worker-service.ts lib/services/execution-command-service.ts lib/services/execution-artifact-service.ts lib/services/execution-decision-service.ts scripts/run-worker.ts package.json tests/unit/execution-worker-service.test.ts tests/unit/execution-decision-service.test.ts
git commit -m "feat: add execution worker and fake runner"
```

## Chunk 4: Execution UI

### Task 6: Add run launch UI to requirement detail

**Files:**
- Create: `components/execution/run-launch-form.tsx`
- Create: `components/execution/run-history-list.tsx`
- Create: `components/execution/run-stage-timeline.tsx`
- Modify: `app/projects/[projectId]/requirements/[requirementId]/page.tsx`
- Modify: `lib/i18n/messages.ts`
- Test: `tests/components/run-launch-form.test.tsx`
- Test: `tests/components/run-stage-timeline.test.tsx`

- [ ] **Step 1: Write the failing launch form test**

```tsx
import { render, screen } from "@testing-library/react";
import { RunLaunchForm } from "@/components/execution/run-launch-form";

test("renders run type and execution mode controls", () => {
  render(<RunLaunchForm labels={...} />);
  expect(screen.getByLabelText(/run type/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/execution mode/i)).toBeInTheDocument();
});
```

- [ ] **Step 2: Run the targeted test to verify it fails**

Run: `DATABASE_URL=file:/tmp/softfactory-dev.db npm run test -- tests/components/run-launch-form.test.tsx --run`
Expected: FAIL because the component does not exist yet

- [ ] **Step 3: Implement execution UI components**

Add:
- run launch form
- run history list
- run stage timeline with statuses, logs, and decision markers

Localize all user-facing labels in both Chinese and English.

- [ ] **Step 4: Wire requirement detail server actions**

Add server actions to:
- create a run
- approve a waiting decision
- reject a waiting decision
- revalidate the requirement page and run detail page

- [ ] **Step 5: Run targeted tests**

Run: `DATABASE_URL=file:/tmp/softfactory-dev.db npm run test -- tests/components/run-launch-form.test.tsx tests/components/run-stage-timeline.test.tsx --run`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add components/execution/run-launch-form.tsx components/execution/run-history-list.tsx components/execution/run-stage-timeline.tsx app/projects/[projectId]/requirements/[requirementId]/page.tsx lib/i18n/messages.ts tests/components/run-launch-form.test.tsx tests/components/run-stage-timeline.test.tsx
git commit -m "feat: add execution controls to requirement detail"
```

### Task 7: Add run detail page and project/approval summaries

**Files:**
- Create: `app/runs/[runId]/page.tsx`
- Create: `components/execution/run-detail-panel.tsx`
- Create: `components/execution/execution-decision-list.tsx`
- Modify: `app/projects/[projectId]/page.tsx`
- Modify: `app/approvals/page.tsx`
- Modify: `components/approvals/approval-list.tsx`
- Modify: `lib/services/dashboard-service.ts`
- Modify: `lib/i18n/messages.ts`
- Test: `tests/components/run-detail-page.test.tsx`

- [ ] **Step 1: Write the failing run detail page test**

```tsx
import { render, screen } from "@testing-library/react";
import RunDetailPage from "@/app/runs/[runId]/page";

test("shows run summary and stage results", async () => {
  const page = await RunDetailPage({ params: Promise.resolve({ runId: seededRun.id }) });
  render(page);
  expect(screen.getByText(/manual gate/i)).toBeInTheDocument();
});
```

- [ ] **Step 2: Run the targeted test to verify it fails**

Run: `DATABASE_URL=file:/tmp/softfactory-dev.db npm run test -- tests/components/run-detail-page.test.tsx --run`
Expected: FAIL because the route does not exist yet

- [ ] **Step 3: Implement run detail page**

Show:
- run summary
- requirement summary
- task package path
- worktree path
- stage timeline
- artifact list
- decision list

- [ ] **Step 4: Extend project and approvals pages**

Add:
- recent runs to project detail
- pending execution decisions to approvals page
- minimal dashboard metrics if the existing dashboard file structure supports it cleanly

- [ ] **Step 5: Run targeted tests**

Run: `DATABASE_URL=file:/tmp/softfactory-dev.db npm run test -- tests/components/run-detail-page.test.tsx --run`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add app/runs/[runId]/page.tsx components/execution/run-detail-panel.tsx components/execution/execution-decision-list.tsx app/projects/[projectId]/page.tsx app/approvals/page.tsx components/approvals/approval-list.tsx lib/services/dashboard-service.ts lib/i18n/messages.ts tests/components/run-detail-page.test.tsx
git commit -m "feat: add execution run detail views"
```

## Chunk 5: Real Runner Hookup and Verification

### Task 8: Add real Claude Code runner adapter behind a safe interface

**Files:**
- Modify: `lib/services/execution-command-service.ts`
- Modify: `README.md`
- Test: `tests/unit/execution-worker-service.test.ts`

- [ ] **Step 1: Add a failing integration-oriented unit test**

```ts
test("uses the configured command adapter for a stage run", async () => {
  const runner = createExecutionCommandRunner({ mode: "fake" });
  expect(runner.kind).toBe("fake");
});
```

- [ ] **Step 2: Run the targeted test to verify it fails**

Run: `DATABASE_URL=file:/tmp/softfactory-dev.db npm run test -- tests/unit/execution-worker-service.test.ts --run`
Expected: FAIL because the adapter API has not been stabilized

- [ ] **Step 3: Add the real runner interface**

Implement:
- fixed command builder for supported stages
- environment-based switch between fake and real runner
- cwd enforcement to the run worktree
- stdout/stderr capture via Node child process APIs

Do not allow free-form shell commands from the UI.

- [ ] **Step 4: Document the runtime contract**

Update `README.md` with:
- `npm run worker`
- fake vs real runner mode
- required local prerequisites for Claude Code execution

- [ ] **Step 5: Run the full verification suite**

Run: `DATABASE_URL=file:/tmp/softfactory-dev.db npm run test -- --run`
Expected: PASS

Run: `npm run lint`
Expected: PASS

Run: `DATABASE_URL=file:/tmp/softfactory-dev.db npm run build`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add lib/services/execution-command-service.ts README.md tests/unit/execution-worker-service.test.ts
git commit -m "feat: add claude code execution adapter"
```

## Notes

- Keep the fake runner as the default in tests to avoid making the suite depend on local Claude Code availability.
- If `npx prisma db push` still hits the local schema-engine error, record that in the execution notes and continue with the known-good `/tmp/softfactory-dev.db` verification path.
- Do not fold execution decisions into the existing `Approval` table in this phase; keep requirement governance and execution governance separate.
