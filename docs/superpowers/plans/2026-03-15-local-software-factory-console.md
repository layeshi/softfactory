# Local Software Factory Console Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a single-user local web console for project management, requirement tracking, change requests, document generation, approval gates, and dashboard visibility.

**Architecture:** Build a single Next.js App Router application with Prisma + SQLite for structured state and filesystem-backed generated documents under a local workspace directory. Keep business logic in server-side service modules so a later Claude Code execution layer can be attached without restructuring the UI.

**Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind CSS 4, Prisma, SQLite, Zod, Vitest, React Testing Library, Prisma seed script

---

## File Structure

### Application shell

- Create: `package.json`
- Create: `tsconfig.json`
- Create: `next.config.ts`
- Create: `postcss.config.mjs`
- Create: `eslint.config.mjs`
- Create: `vitest.config.ts`
- Create: `vitest.setup.ts`
- Create: `next-env.d.ts`
- Create: `app/layout.tsx`
- Create: `app/page.tsx`
- Create: `app/globals.css`

### Shared UI and layout

- Create: `components/layout/app-shell.tsx`
- Create: `components/layout/sidebar-nav.tsx`
- Create: `components/dashboard/metric-card.tsx`
- Create: `components/dashboard/status-panel.tsx`
- Create: `components/projects/project-form.tsx`
- Create: `components/projects/project-list.tsx`
- Create: `components/requirements/requirement-form.tsx`
- Create: `components/requirements/stage-timeline.tsx`
- Create: `components/change-requests/change-request-form.tsx`
- Create: `components/documents/document-list.tsx`
- Create: `components/approvals/approval-list.tsx`

### Routes

- Create: `app/projects/page.tsx`
- Create: `app/projects/new/page.tsx`
- Create: `app/projects/[projectId]/page.tsx`
- Create: `app/projects/[projectId]/requirements/[requirementId]/page.tsx`
- Create: `app/approvals/page.tsx`
- Create: `app/documents/page.tsx`

### Domain and persistence

- Create: `prisma/schema.prisma`
- Create: `prisma/seed.ts`
- Create: `lib/db.ts`
- Create: `lib/constants/workflow.ts`
- Create: `lib/utils.ts`
- Create: `lib/validators/project.ts`
- Create: `lib/validators/requirement.ts`
- Create: `lib/validators/change-request.ts`
- Create: `lib/services/dashboard-service.ts`
- Create: `lib/services/project-service.ts`
- Create: `lib/services/requirement-service.ts`
- Create: `lib/services/change-request-service.ts`
- Create: `lib/services/document-service.ts`
- Create: `lib/services/approval-service.ts`
- Create: `lib/services/activity-service.ts`
- Create: `lib/services/workspace-service.ts`

### API / server actions

- Create: `app/api/projects/route.ts`
- Create: `app/api/projects/[projectId]/route.ts`
- Create: `app/api/projects/[projectId]/requirements/route.ts`
- Create: `app/api/requirements/[requirementId]/route.ts`
- Create: `app/api/change-requests/route.ts`
- Create: `app/api/change-requests/[changeRequestId]/approve/route.ts`
- Create: `app/api/approvals/[approvalId]/route.ts`
- Create: `app/api/documents/generate/route.ts`

### Tests

- Create: `tests/unit/workflow.test.ts`
- Create: `tests/unit/project-service.test.ts`
- Create: `tests/unit/requirement-service.test.ts`
- Create: `tests/unit/change-request-service.test.ts`
- Create: `tests/unit/document-service.test.ts`
- Create: `tests/unit/dashboard-service.test.ts`
- Create: `tests/components/project-list.test.tsx`
- Create: `tests/components/stage-timeline.test.tsx`

## Chunk 1: Foundation and Tooling

### Task 1: Scaffold the local web app foundation

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `next.config.ts`
- Create: `postcss.config.mjs`
- Create: `eslint.config.mjs`
- Create: `vitest.config.ts`
- Create: `vitest.setup.ts`
- Create: `next-env.d.ts`
- Create: `app/layout.tsx`
- Create: `app/page.tsx`
- Create: `app/globals.css`

- [ ] **Step 1: Write the failing shell test**

```tsx
import { render, screen } from "@testing-library/react";
import HomePage from "@/app/page";

test("renders the dashboard heading", () => {
  render(<HomePage />);
  expect(screen.getByRole("heading", { name: /software factory/i })).toBeInTheDocument();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- tests/components/home-page.test.tsx --runInBand`
Expected: FAIL with missing app file or missing heading

- [ ] **Step 3: Write the minimal app shell**

```tsx
export default function HomePage() {
  return <h1>Software Factory</h1>;
}
```

- [ ] **Step 4: Fill in the real foundation**

Implement:
- `package.json` scripts: `dev`, `build`, `lint`, `test`, `test:watch`, `prisma:generate`, `prisma:migrate`, `db:seed`
- Next.js app router config with TypeScript path alias `@/*`
- base layout with sidebar shell slot
- global CSS variables and dashboard-friendly visual system

- [ ] **Step 5: Run tests and lint**

Run: `npm run test -- --run`
Expected: PASS for the shell test

Run: `npm run lint`
Expected: PASS with no ESLint errors

- [ ] **Step 6: Commit**

```bash
git add package.json tsconfig.json next.config.ts postcss.config.mjs eslint.config.mjs vitest.config.ts vitest.setup.ts next-env.d.ts app/layout.tsx app/page.tsx app/globals.css tests/components/home-page.test.tsx
git commit -m "feat: scaffold local software factory app"
```

### Task 2: Establish shared workflow constants and layout components

**Files:**
- Create: `lib/constants/workflow.ts`
- Create: `components/layout/app-shell.tsx`
- Create: `components/layout/sidebar-nav.tsx`
- Create: `components/dashboard/metric-card.tsx`
- Create: `components/dashboard/status-panel.tsx`
- Test: `tests/unit/workflow.test.ts`

- [ ] **Step 1: Write the failing workflow constant tests**

```ts
import { REQUIREMENT_STAGES, PROJECT_STATUSES } from "@/lib/constants/workflow";

test("defines the fixed requirement stage order", () => {
  expect(REQUIREMENT_STAGES).toEqual([
    "requirement",
    "design",
    "development",
    "test",
    "approval",
  ]);
});

test("includes blocked as a project status", () => {
  expect(PROJECT_STATUSES).toContain("blocked");
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- tests/unit/workflow.test.ts --run`
Expected: FAIL with missing module

- [ ] **Step 3: Implement the constants and layout shell**

```ts
export const REQUIREMENT_STAGES = [
  "requirement",
  "design",
  "development",
  "test",
  "approval",
] as const;
```

Implement:
- workflow constants for project, requirement, stage, change request, and approval states
- sidebar navigation for Dashboard, Projects, Documents, Approvals
- reusable metric and status panels for dashboard cards

- [ ] **Step 4: Run tests**

Run: `npm run test -- tests/unit/workflow.test.ts --run`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add lib/constants/workflow.ts components/layout/app-shell.tsx components/layout/sidebar-nav.tsx components/dashboard/metric-card.tsx components/dashboard/status-panel.tsx tests/unit/workflow.test.ts
git commit -m "feat: add workflow constants and app shell components"
```

## Chunk 2: Database and Domain Services

### Task 3: Define the Prisma schema and seed data

**Files:**
- Create: `prisma/schema.prisma`
- Create: `prisma/seed.ts`
- Create: `lib/db.ts`
- Test: `tests/unit/project-service.test.ts`

- [ ] **Step 1: Write a failing schema-oriented service test**

```ts
import { createProject } from "@/lib/services/project-service";

test("creates a project with draft status by default", async () => {
  const project = await createProject({
    name: "Alpha Factory",
    summary: "Track the first project",
    goal: "Validate the MVP",
  });

  expect(project.status).toBe("draft");
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- tests/unit/project-service.test.ts --run`
Expected: FAIL with missing service or missing database client

- [ ] **Step 3: Implement Prisma schema**

Include models:
- `Project`
- `Requirement`
- `RequirementStage`
- `ChangeRequest`
- `Document`
- `Approval`
- `ActivityLog`

Key schema details:
- enum-backed status fields where Prisma supports them
- `Requirement.version` default `1`
- soft-delete semantics via `Requirement.lifecycleStatus`
- relations from project to requirements, documents, approvals, activity logs, and change requests

- [ ] **Step 4: Implement seed data**

Seed:
- 2 example projects
- 3 example requirements
- stage rows for each requirement
- one pending approval
- one change request
- one generated requirement document metadata row

- [ ] **Step 5: Generate client and migrate**

Run: `npm run prisma:generate`
Expected: PASS with generated Prisma client

Run: `npm run prisma:migrate -- --name init`
Expected: PASS with new SQLite migration

Run: `npm run db:seed`
Expected: PASS with inserted demo rows

- [ ] **Step 6: Commit**

```bash
git add prisma/schema.prisma prisma/seed.ts lib/db.ts tests/unit/project-service.test.ts
git commit -m "feat: add prisma schema and seed data"
```

### Task 4: Build project, requirement, and activity services

**Files:**
- Create: `lib/validators/project.ts`
- Create: `lib/validators/requirement.ts`
- Create: `lib/services/project-service.ts`
- Create: `lib/services/requirement-service.ts`
- Create: `lib/services/activity-service.ts`
- Test: `tests/unit/project-service.test.ts`
- Test: `tests/unit/requirement-service.test.ts`

- [ ] **Step 1: Expand failing tests for core service behavior**

```ts
test("creates requirement stage rows in fixed order", async () => {
  const requirement = await createRequirement({
    projectId: "project-id",
    title: "Requirement A",
    originalRequest: "Build reporting",
    normalizedDescription: "Structured reporting requirement",
    priority: "high",
  });

  expect(requirement.stages.map((stage) => stage.stageType)).toEqual([
    "requirement",
    "design",
    "development",
    "test",
    "approval",
  ]);
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm run test -- tests/unit/project-service.test.ts tests/unit/requirement-service.test.ts --run`
Expected: FAIL with missing validators or missing stage initialization

- [ ] **Step 3: Implement validation and services**

Implement:
- `createProject`, `updateProject`, `deleteProject`, `listProjects`, `getProjectDetail`
- `createRequirement`, `updateRequirement`, `getRequirementDetail`
- stage initialization helper that always creates the five fixed stages
- activity logging helper called from every create/update/delete path

- [ ] **Step 4: Run tests**

Run: `npm run test -- tests/unit/project-service.test.ts tests/unit/requirement-service.test.ts --run`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add lib/validators/project.ts lib/validators/requirement.ts lib/services/project-service.ts lib/services/requirement-service.ts lib/services/activity-service.ts tests/unit/project-service.test.ts tests/unit/requirement-service.test.ts
git commit -m "feat: add project and requirement domain services"
```

### Task 5: Build change request, approval, document, and workspace services

**Files:**
- Create: `lib/validators/change-request.ts`
- Create: `lib/services/change-request-service.ts`
- Create: `lib/services/approval-service.ts`
- Create: `lib/services/document-service.ts`
- Create: `lib/services/workspace-service.ts`
- Test: `tests/unit/change-request-service.test.ts`
- Test: `tests/unit/document-service.test.ts`

- [ ] **Step 1: Write failing tests for change request behavior**

```ts
test("approving an add change request creates a new requirement", async () => {
  const changeRequest = await createChangeRequest({
    projectId: "project-id",
    changeType: "add",
    proposedTitle: "New requirement",
    proposedContent: "Capture audit logs",
    reason: "Needed for traceability",
    impactSummary: "Adds one more requirement",
  });

  const result = await approveChangeRequest(changeRequest.id, "approve");
  expect(result.createdRequirement?.title).toBe("New requirement");
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm run test -- tests/unit/change-request-service.test.ts tests/unit/document-service.test.ts --run`
Expected: FAIL with missing service implementations

- [ ] **Step 3: Implement change request flows**

Implement:
- `createChangeRequest`
- `listChangeRequests`
- `approveChangeRequest`
- `rejectChangeRequest`

Rules:
- `modify`: update target requirement, increment version, mark lifecycle as `changed`
- `add`: create new requirement and stage rows after approval
- `delete`: mark target requirement as `removed` after approval

- [ ] **Step 4: Implement document generation and workspace persistence**

Implement:
- workspace root resolver, defaulting to `workspace/projects`
- directory creation by project slug
- markdown document generation for requirement, design, and test docs
- `generateDocument` that writes files and stores `Document` rows

- [ ] **Step 5: Run tests**

Run: `npm run test -- tests/unit/change-request-service.test.ts tests/unit/document-service.test.ts --run`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add lib/validators/change-request.ts lib/services/change-request-service.ts lib/services/approval-service.ts lib/services/document-service.ts lib/services/workspace-service.ts tests/unit/change-request-service.test.ts tests/unit/document-service.test.ts
git commit -m "feat: add change request approval and document services"
```

### Task 6: Build dashboard aggregation service

**Files:**
- Create: `lib/services/dashboard-service.ts`
- Test: `tests/unit/dashboard-service.test.ts`

- [ ] **Step 1: Write the failing dashboard aggregation test**

```ts
import { getDashboardSummary } from "@/lib/services/dashboard-service";

test("returns pending approval and change request counts", async () => {
  const summary = await getDashboardSummary();

  expect(summary.pendingApprovals).toBeGreaterThanOrEqual(0);
  expect(summary.recentChanges).toBeDefined();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- tests/unit/dashboard-service.test.ts --run`
Expected: FAIL with missing service

- [ ] **Step 3: Implement the aggregation service**

Implement:
- project status counts
- pending approval count
- pending change request count
- recent activity rows
- recent documents

- [ ] **Step 4: Run tests**

Run: `npm run test -- tests/unit/dashboard-service.test.ts --run`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add lib/services/dashboard-service.ts tests/unit/dashboard-service.test.ts
git commit -m "feat: add dashboard aggregation service"
```

## Chunk 3: Routes, Pages, and Forms

### Task 7: Expose CRUD and workflow APIs

**Files:**
- Create: `app/api/projects/route.ts`
- Create: `app/api/projects/[projectId]/route.ts`
- Create: `app/api/projects/[projectId]/requirements/route.ts`
- Create: `app/api/requirements/[requirementId]/route.ts`
- Create: `app/api/change-requests/route.ts`
- Create: `app/api/change-requests/[changeRequestId]/approve/route.ts`
- Create: `app/api/approvals/[approvalId]/route.ts`
- Create: `app/api/documents/generate/route.ts`

- [ ] **Step 1: Write one failing request test per route family**

```ts
test("POST /api/projects creates a project", async () => {
  const response = await POST(
    new Request("http://localhost/api/projects", {
      method: "POST",
      body: JSON.stringify({ name: "Beta", summary: "Test", goal: "Ship MVP" }),
    }),
  );

  expect(response.status).toBe(201);
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm run test -- tests/unit/api-projects.test.ts --run`
Expected: FAIL with missing route handler

- [ ] **Step 3: Implement route handlers**

Implement:
- JSON validation with Zod
- 201 for create routes
- 200 for update and approval actions
- 400 for invalid payloads
- 404 for missing records

- [ ] **Step 4: Run route tests**

Run: `npm run test -- tests/unit/api-projects.test.ts tests/unit/api-change-requests.test.ts --run`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add app/api/projects/route.ts app/api/projects/[projectId]/route.ts app/api/projects/[projectId]/requirements/route.ts app/api/requirements/[requirementId]/route.ts app/api/change-requests/route.ts app/api/change-requests/[changeRequestId]/approve/route.ts app/api/approvals/[approvalId]/route.ts app/api/documents/generate/route.ts tests/unit/api-projects.test.ts tests/unit/api-change-requests.test.ts
git commit -m "feat: add application route handlers"
```

### Task 8: Build project and dashboard pages

**Files:**
- Modify: `app/page.tsx`
- Create: `app/projects/page.tsx`
- Create: `app/projects/new/page.tsx`
- Create: `components/projects/project-form.tsx`
- Create: `components/projects/project-list.tsx`
- Create: `tests/components/project-list.test.tsx`

- [ ] **Step 1: Write failing component tests**

```tsx
test("renders project status badges", () => {
  render(
    <ProjectList
      projects={[{ id: "1", name: "Alpha", status: "blocked", requirementCount: 2, updatedAt: "2026-03-15" }]}
    />,
  );

  expect(screen.getByText(/blocked/i)).toBeInTheDocument();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- tests/components/project-list.test.tsx --run`
Expected: FAIL with missing component

- [ ] **Step 3: Implement dashboard and project pages**

Implement:
- server-rendered dashboard using `getDashboardSummary`
- project list page with summary table and filter controls
- new project page with form submission to `/api/projects`
- clear empty states and inline success/error messages

- [ ] **Step 4: Run tests**

Run: `npm run test -- tests/components/project-list.test.tsx --run`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add app/page.tsx app/projects/page.tsx app/projects/new/page.tsx components/projects/project-form.tsx components/projects/project-list.tsx tests/components/project-list.test.tsx
git commit -m "feat: add dashboard and project management pages"
```

### Task 9: Build project detail and requirement detail pages

**Files:**
- Create: `app/projects/[projectId]/page.tsx`
- Create: `app/projects/[projectId]/requirements/[requirementId]/page.tsx`
- Create: `components/requirements/requirement-form.tsx`
- Create: `components/requirements/stage-timeline.tsx`
- Create: `tests/components/stage-timeline.test.tsx`

- [ ] **Step 1: Write failing stage timeline tests**

```tsx
test("renders the five standard engineering stages in order", () => {
  render(<StageTimeline stages={[
    { stageType: "requirement", status: "completed" },
    { stageType: "design", status: "pending_confirmation" },
    { stageType: "development", status: "not_started" },
    { stageType: "test", status: "not_started" },
    { stageType: "approval", status: "not_started" },
  ]} />);

  expect(screen.getAllByRole("listitem")).toHaveLength(5);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- tests/components/stage-timeline.test.tsx --run`
Expected: FAIL with missing component

- [ ] **Step 3: Implement detail pages**

Implement:
- project detail page with project summary, requirement list, pending approvals, recent docs, recent activity
- requirement detail page with stage timeline, current summaries, linked docs, and change request action
- requirement form posted to `/api/projects/[projectId]/requirements`

- [ ] **Step 4: Run tests**

Run: `npm run test -- tests/components/stage-timeline.test.tsx --run`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add app/projects/[projectId]/page.tsx app/projects/[projectId]/requirements/[requirementId]/page.tsx components/requirements/requirement-form.tsx components/requirements/stage-timeline.tsx tests/components/stage-timeline.test.tsx
git commit -m "feat: add requirement workflow detail pages"
```

### Task 10: Build change request, approvals, and documents pages

**Files:**
- Create: `app/approvals/page.tsx`
- Create: `app/documents/page.tsx`
- Create: `components/change-requests/change-request-form.tsx`
- Create: `components/documents/document-list.tsx`
- Create: `components/approvals/approval-list.tsx`

- [ ] **Step 1: Write failing interaction tests**

```tsx
test("shows all three change request types", () => {
  render(<ChangeRequestForm projectId="project-1" />);

  expect(screen.getByLabelText(/modify existing requirement/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/add new requirement/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/delete existing requirement/i)).toBeInTheDocument();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- tests/components/change-request-form.test.tsx --run`
Expected: FAIL with missing form component

- [ ] **Step 3: Implement operations pages and forms**

Implement:
- approvals page with pending and completed sections
- documents page with document type filters
- change request form with `modify`, `add`, `delete` choices
- document generation action wiring to `/api/documents/generate`

- [ ] **Step 4: Run tests**

Run: `npm run test -- tests/components/change-request-form.test.tsx --run`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add app/approvals/page.tsx app/documents/page.tsx components/change-requests/change-request-form.tsx components/documents/document-list.tsx components/approvals/approval-list.tsx tests/components/change-request-form.test.tsx
git commit -m "feat: add change request approvals and document pages"
```

## Chunk 4: Finish, Seed, and Verify

### Task 11: Add robust seed-driven dashboard behavior

**Files:**
- Modify: `prisma/seed.ts`
- Modify: `app/page.tsx`
- Modify: `app/projects/[projectId]/page.tsx`

- [ ] **Step 1: Write a failing dashboard snapshot test**

```ts
test("dashboard summary includes recent change and pending approval panels", async () => {
  const summary = await getDashboardSummary();
  expect(summary.recentChanges.length).toBeGreaterThan(0);
  expect(summary.pendingApprovals).toBeGreaterThan(0);
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm run test -- tests/unit/dashboard-service.test.ts --run`
Expected: FAIL if seed data no longer satisfies dashboard assumptions

- [ ] **Step 3: Adjust seed and page bindings**

Implement:
- seed scenarios that exercise all cards
- dashboard components that display counts, recent documents, and recent activity cleanly
- project detail widgets that surface the same seeded relationships

- [ ] **Step 4: Run tests**

Run: `npm run test -- --run`
Expected: PASS for all unit and component tests

- [ ] **Step 5: Commit**

```bash
git add prisma/seed.ts app/page.tsx app/projects/[projectId]/page.tsx tests/unit/dashboard-service.test.ts
git commit -m "feat: enrich dashboard with seeded workflow data"
```

### Task 12: Final verification and developer handoff

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Write the README for zero-context setup**

Include:
- prerequisites
- install command
- migrate command
- seed command
- dev server command
- test command
- workspace document path behavior

- [ ] **Step 2: Run the required verification commands**

Run: `npm install`
Expected: PASS with lockfile created

Run: `npm run prisma:generate`
Expected: PASS

Run: `npm run prisma:migrate -- --name init`
Expected: PASS

Run: `npm run db:seed`
Expected: PASS

Run: `npm run test -- --run`
Expected: PASS

Run: `npm run lint`
Expected: PASS

Run: `npm run build`
Expected: PASS with production build output

- [ ] **Step 3: Commit**

```bash
git add README.md package-lock.json prisma app components lib tests
git commit -m "docs: add local setup and verification guide"
```

## Execution Notes

- Use `@superpowers:test-driven-development` for each task before implementation code.
- Use `@superpowers:verification-before-completion` before claiming the app is working.
- Keep generated workspace artifacts out of git except for intentional example docs.
- Do not add live Claude Code execution in this plan; leave clear extension points only.
