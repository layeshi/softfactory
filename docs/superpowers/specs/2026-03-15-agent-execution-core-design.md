# Agent Execution Core Design

## Overview

This document defines phase 2 of the local software factory console: a real execution core that can run design, development, and test stages through local Claude Code workflows. Phase 1 created the project, requirement, change, approval, document, and dashboard foundation. Phase 2 adds a task-driven execution domain, isolated run environments, and human-in-the-loop control for agent work.

## Goals

- Execute real agent-driven stage work for a requirement.
- Support single-task execution mode selection at launch time.
- Support both full requirement runs and single-stage runs.
- Create a stable project workspace directory when a project is created.
- Create a local empty Git repository for each new project.
- Isolate each execution in its own worktree-managed environment.
- Preserve auditable task packages, logs, outputs, and decisions for every run.
- Integrate run status and decision points into the existing web console.

## Non-Goals

- Multi-user execution permissions or distributed workers.
- Parallel task scheduling or advanced queue prioritization.
- External repository import or binding to pre-existing repositories.
- Arbitrary shell execution from the UI.
- Fully automatic requirement intake rewriting by the agent.

## Product Scope

Phase 2 extends the single-user local console into a real local execution system. The operator still creates and manages projects and requirements through the web UI, but can now start a run against a requirement. The system prepares a task package, provisions an isolated execution environment, invokes Claude Code, stores outputs, and either auto-progresses or pauses for approval depending on the task's execution mode.

## Functional Summary

### Supported Task Shapes

- `full_run`: continue a requirement from its current stage through remaining executable stages
- `stage_run`: run only one target stage

### Supported Execution Modes

- `manual_gate`: pause at configured decision stages and wait for operator approval
- `auto_flow`: automatically continue to the next stage unless a failure occurs

The data model should preserve room for later introduction of a `hybrid` mode, but phase 2 UI and execution logic only need to support the two modes above.

### Executable Stages

Phase 2 should execute only these stages:

- `design`
- `development`
- `test`

Requirement intake remains a human-authored input in the management console.

## Architecture

### Runtime Model

Keep the application as a local monolith plus a local worker:

- `Next.js` app for UI, server actions, and task creation
- `SQLite` + `Prisma` for business and execution state
- Local filesystem for project workspaces, task packages, logs, and artifacts
- A local `worker` process that polls queued runs and performs execution

The web app creates and displays execution work. The worker owns long-running execution and status transitions.

### Core Boundaries

- The web layer creates runs and records human decisions.
- The worker prepares worktrees, writes task packages, runs commands, and captures results.
- The project workspace is a long-lived container for one project.
- The worktree is a short-lived isolated environment for one run.
- The task package is the execution source of truth for a run.

### Project Workspace Layout

Each project should have a stable directory under the configured workspace root:

```text
workspace/projects/<project-slug>/
  repo/
  docs/
    requirements/
    designs/
    tests/
  runs/
    <run-id>/
      task.json
      stdout.log
      stderr.log
      result.json
      artifacts/
  artifacts/
  temp/
```

### Repository Model

When a project is created, the system should:

1. Create the project workspace directories
2. Create `repo/`
3. Initialize an empty Git repository inside `repo/`
4. Make the repo path discoverable by execution services

Phase 2 does not need to support attaching existing repositories.

### Worktree Model

Each execution run should use an isolated worktree derived from the project's `repo/` directory. The worker is responsible for:

- creating a branch name for the run
- creating the worktree path
- running the stage command in that worktree
- recording the worktree path on the run
- applying retention or cleanup rules later

Phase 2 should prefer keeping worktrees after execution for auditability. Cleanup automation can be deferred.

## Data Model

Add a new execution domain rather than overloading requirement or approval tables.

### `ExecutionRun`

Represents one operator-launched run.

Fields:

- `id`
- `projectId`
- `requirementId`
- `runType`
- `executionMode`
- `targetStage`
- `status`
- `currentStage`
- `workspacePath`
- `repoPath`
- `worktreePath`
- `taskPackagePath`
- `startedAt`
- `finishedAt`
- `createdAt`
- `updatedAt`

Status values:

- `queued`
- `preparing`
- `running`
- `waiting_for_decision`
- `succeeded`
- `failed`
- `cancelled`

### `ExecutionStageRun`

Represents a single stage attempt within an execution run.

Fields:

- `id`
- `executionRunId`
- `stageType`
- `status`
- `attempt`
- `inputSnapshotPath`
- `resultSnapshotPath`
- `stdoutPath`
- `stderrPath`
- `startedAt`
- `finishedAt`
- `createdAt`
- `updatedAt`

Status values:

- `pending`
- `running`
- `waiting_for_decision`
- `succeeded`
- `failed`
- `skipped`

### `ExecutionArtifact`

Represents a generated output tied to a run or stage.

Fields:

- `id`
- `executionRunId`
- `executionStageRunId`
- `artifactType`
- `title`
- `filePath`
- `summary`
- `createdAt`

Examples:

- design summary
- implementation notes
- test report
- generated markdown documents

### `ExecutionDecision`

Represents a human decision on a run or stage checkpoint.

Fields:

- `id`
- `executionRunId`
- `executionStageRunId`
- `decisionType`
- `status`
- `comment`
- `decidedAt`
- `createdAt`

Decision types for phase 2:

- `design_review`
- `implementation_review`
- `test_review`

Decision status values:

- `pending`
- `approved`
- `rejected`

## Task Package

Every run writes a durable task package to `runs/<run-id>/task.json`.

Minimum structure:

```json
{
  "run": {
    "runId": "run_xxx",
    "runType": "full_run",
    "executionMode": "manual_gate",
    "targetStage": null
  },
  "project": {
    "projectId": "proj_xxx",
    "name": "Project Name",
    "slug": "project-name",
    "workspacePath": "/tmp/softfactory-workspace/projects/project-name",
    "repoPath": "/tmp/softfactory-workspace/projects/project-name/repo"
  },
  "requirement": {
    "requirementId": "req_xxx",
    "title": "Requirement title",
    "originalRequest": "...",
    "normalizedDescription": "...",
    "priority": "high",
    "version": 2
  },
  "workflow": {
    "currentStage": "design",
    "stagesToRun": ["design", "development", "test"],
    "decisionStages": ["design", "test"]
  },
  "context": {
    "documentPaths": [],
    "recentChangeSummary": [],
    "recentApprovalSummary": []
  },
  "outputContract": {
    "artifacts": [],
    "writePaths": [],
    "summaryRequired": true
  },
  "command": {
    "type": "claude_code",
    "argv": [],
    "cwd": "/tmp/softfactory-workspace/projects/project-name/repo"
  }
}
```

The package exists to make execution reproducible, inspectable, and replayable.

## Workflow Rules

### Run Creation

1. Operator opens a requirement
2. Operator chooses run type and execution mode
3. Server validates the requirement and executable stage selection
4. Server creates `ExecutionRun` in `queued`
5. UI shows the run in the requirement page and run detail page

### Worker Preparation

1. Worker claims one queued run
2. Worker verifies project workspace and repo exist
3. Worker creates the run directory
4. Worker creates an isolated worktree
5. Worker writes `task.json`
6. Worker updates run status to `preparing`, then `running`

### Stage Execution

For each stage to be run:

1. Create `ExecutionStageRun`
2. Write stage-specific input snapshot
3. Invoke Claude Code through a fixed command template
4. Capture stdout, stderr, exit code, and output files
5. Persist stage artifacts and summary
6. Mark stage as succeeded or failed

### Decision Gates

If a stage completes successfully:

- `manual_gate`: pause on configured decision stages and create a pending `ExecutionDecision`
- `auto_flow`: continue automatically to the next stage

If a stage fails:

- mark the stage as failed
- mark the run as failed
- expose logs and artifacts for operator review

### Run Completion

When all targeted stages succeed:

- mark the run as `succeeded`
- update requirement stage summaries and statuses where appropriate
- generate or refresh design/test documents when the matching stage succeeded

## Human-in-the-Loop Rules

Phase 2 should integrate execution decisions with the existing approval-oriented product structure, but keep execution decisions separate from the current `Approval` model.

Rules:

- `design` stage may require `design_review`
- `development` stage may require `implementation_review`
- `test` stage may require `test_review`
- approval is recorded on the specific stage run, not just on the requirement
- a rejected decision returns the run to a stopped state and does not auto-advance

This separation keeps requirement governance and execution governance distinct.

## UI Changes

### Requirement Detail

Add:

- run launch panel
- run type selector
- execution mode selector
- stage selector for `stage_run`
- execution history list
- current run timeline
- decision action buttons
- links to task package, logs, and artifacts

### Project Detail

Add:

- recent runs summary
- latest failed runs
- latest waiting-for-decision runs

### Approvals View

Extend or complement with:

- execution decisions waiting for review
- links back to run detail and requirement detail

### New Run Detail Page

Add a dedicated page for one run showing:

- run summary
- requirement summary
- stage timeline
- task package metadata
- worktree path
- stdout/stderr access
- generated artifacts
- decision history

## Error Handling

Phase 2 should explicitly distinguish:

- workspace preparation failure
- repo initialization failure
- worktree creation failure
- task package write failure
- command execution failure
- artifact parse failure
- decision rejection

These errors should be visible in run detail and recoverable through later rerun functionality.

## Security Constraints

- only run commands inside the project's repo or run worktree
- never accept raw shell input from the UI
- use fixed command builders for supported stage types
- record exact task package and paths for audit
- keep run directories separate so one run cannot overwrite another's artifacts

## Testing Strategy

### Unit Tests

- stage selection logic for `full_run` and `stage_run`
- run state transitions
- decision gate logic for `manual_gate` and `auto_flow`
- task package generation
- project workspace path building

### Service Tests

- creating a run
- claiming and starting a queued run
- recording stage output
- storing execution decisions
- repo initialization on project creation

### Component Tests

- requirement detail run launcher
- execution timeline
- run detail summary
- waiting-for-decision actions

### Integration Tests

Use a fake command runner rather than real Claude Code:

- verify one run can move from `queued` to `succeeded`
- verify `manual_gate` pauses after the configured stage
- verify `auto_flow` continues automatically
- verify failures persist logs and fail the run cleanly

## Key Decisions

### Decision 1: Use a local worker instead of request-bound execution

Chosen because long-running agent work should not be tied to web request lifetimes, and the worker boundary supports future retries and queue controls.

### Decision 2: Use task packages instead of direct ad hoc command construction

Chosen because software factory runs must be auditable, replayable, and reviewable.

### Decision 3: Create a stable project workspace plus per-run worktrees

Chosen because a project needs durable storage, while execution needs isolation.

### Decision 4: Support execution mode per task, not per project

Chosen because operators need to vary the degree of automation from one run to the next without changing project defaults.

## Risks and Mitigations

- Worker/process coordination complexity
  - Mitigation: single worker, single-run claim semantics in phase 2
- Worktree lifecycle sprawl
  - Mitigation: retain paths in the database and defer automated cleanup
- Real Claude Code integration uncertainty
  - Mitigation: abstract command construction and verify the full path first with a fake runner
- State drift between filesystem and database
  - Mitigation: always write artifacts to disk before final database status updates

## Phased Delivery Within Phase 2

### Phase 2A

- execution data model
- workspace + repo creation
- run launch UI
- fake worker and fake command runner
- run detail page

### Phase 2B

- real Claude Code command runner
- worktree provisioning
- design and test artifact generation from execution output
- decision gates wired into execution flow

