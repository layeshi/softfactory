# Local Software Factory Console Design

## Overview

This document defines the first sub-project of the software factory product: a single-user local web management console. The first release focuses on project management, requirement intake, process visibility, document generation, change handling, and human approval gates. It does not yet execute Claude Code or Superpowers tasks; it prepares the orchestration surface and data model for that next phase.

## Goals

- Accept complete user development requirements under a project.
- Manage projects with create, update, delete capabilities.
- Track each requirement through a standard engineering workflow.
- Support requirement changes, including modify, add, and delete actions.
- Generate requirement, design, and test documents as filesystem artifacts with database metadata.
- Require human confirmation at key approval points.
- Provide a dashboard that gives a full view of project and requirement status.

## Non-Goals

- Multi-user accounts, login, roles, and permissions.
- Real execution of Claude Code or Superpowers skills.
- Remote repository hosting or deep Git provider integration.
- Notifications or collaboration workflows.

## Product Scope

The first release is a local web management console for a single operator. It is intended to create a stable product and data foundation before adding real agent execution.

Included modules:

- Dashboard
- Project management
- Requirement management
- Engineering stage tracking
- Document generation and browsing
- Change request handling
- Approval queue
- Activity log

## Architecture

### Runtime Model

Use a local monolithic web application:

- `Next.js` for the web UI and local API routes
- `SQLite` for persistence
- `Prisma` for schema management and data access
- Local filesystem for generated document files

This keeps first-release development fast while preserving a clean upgrade path. Structured state lives in the database; durable generated artifacts live on disk.

### Module Boundaries

- `Project module`: project CRUD, project summary, project lifecycle state
- `Requirement module`: full requirement intake, requirement detail, requirement lifecycle state
- `Stage workflow module`: stage records for requirement, design, development, test, approval
- `Change module`: change requests for modify, add, delete
- `Document module`: generated document metadata and file access
- `Approval module`: manual confirmation gates and decisions
- `Dashboard module`: overview metrics, queues, and recent activity
- `Activity module`: append-only trace of important operations

### Future Extension Point

Reserve a task orchestration layer in the domain model and UI, but keep it as a placeholder in the first release. Later phases can replace placeholder stage actions with real Claude Code and Superpowers execution without changing the primary page structure or workflow.

## Core Pages

### Dashboard

Default landing page with:

- Project totals and status distribution
- In-progress and blocked project counts
- Pending approval count
- Recent change requests
- Recently generated documents
- Quick actions for project and requirement creation

### Project List

List all projects with:

- Name
- Summary
- Project status
- Requirement count
- Current stage summary
- Updated timestamp

Actions:

- Create project
- Edit project
- Delete project
- Filter by status

### Project Detail

Primary workspace for a project:

- Project summary and milestone panel
- Requirement list
- Pending approvals panel
- Recent documents panel
- Recent activity panel

Primary actions:

- Add requirement
- Start change request
- Generate documents
- Submit for approval

### Requirement Detail

Detailed view for one requirement with a standard stage flow:

- Requirement
- Design
- Development
- Test
- Approval

Each stage displays:

- Status
- Summary
- Notes
- Updated time
- Linked documents

### Documents and Approvals

Dedicated operational views:

- Document list with type, version, linked object, generated time
- Approval queue with pending decisions and prior outcomes

## Workflow Design

### Project Lifecycle

Project status:

- `draft`
- `in_progress`
- `blocked`
- `completed`
- `archived`

### Requirement Lifecycle

Requirement status:

- `pending_triage`
- `in_progress`
- `pending_approval`
- `completed`
- `changed`

Requirement lifecycle status:

- `active`
- `changed`
- `removed`

### Stage Lifecycle

Each requirement has fixed stage records:

- `requirement`
- `design`
- `development`
- `test`
- `approval`

Each stage status:

- `not_started`
- `in_progress`
- `pending_confirmation`
- `completed`
- `rejected`

## Data Model

### Project

Fields:

- `id`
- `name`
- `slug`
- `summary`
- `goal`
- `status`
- `createdAt`
- `updatedAt`

### Requirement

Fields:

- `id`
- `projectId`
- `title`
- `originalRequest`
- `normalizedDescription`
- `priority`
- `status`
- `lifecycleStatus`
- `version`
- `createdAt`
- `updatedAt`

### RequirementStage

Fields:

- `id`
- `requirementId`
- `stageType`
- `status`
- `summary`
- `notes`
- `completedAt`
- `updatedAt`

### ChangeRequest

Fields:

- `id`
- `projectId`
- `changeType`
- `targetRequirementId`
- `proposedTitle`
- `proposedContent`
- `reason`
- `impactSummary`
- `status`
- `appliedAt`
- `createdAt`
- `updatedAt`

Change type values:

- `modify`
- `add`
- `delete`

Change status values:

- `draft`
- `pending_approval`
- `approved`
- `rejected`
- `applied`

### Document

Fields:

- `id`
- `projectId`
- `requirementId`
- `documentType`
- `title`
- `version`
- `filePath`
- `generatedAt`

Document types:

- `requirement`
- `design`
- `test`

### Approval

Fields:

- `id`
- `projectId`
- `requirementId`
- `changeRequestId`
- `approvalType`
- `status`
- `comment`
- `decidedAt`
- `createdAt`

### ActivityLog

Fields:

- `id`
- `projectId`
- `requirementId`
- `changeRequestId`
- `actionType`
- `message`
- `createdAt`

## Change Handling

The first release must treat requirement changes as formal change requests instead of direct edits.

### Modify Existing Requirement

- Create a `ChangeRequest` with `changeType=modify`
- Preserve the original requirement record for traceability
- After approval, update the requirement to a new version
- Log the change and keep document history

### Add New Requirement

- Create a `ChangeRequest` with `changeType=add`
- No target requirement is required
- After approval, create a new requirement and initialize its stage records

### Delete Existing Requirement

- Create a `ChangeRequest` with `changeType=delete`
- Do not physically remove the requirement
- After approval, mark the requirement as `removed`
- Preserve all prior documents, approvals, and activity history

## Approval Rules

The first release is single-user, so approvals are self-confirmation gates rather than multi-party routing.

Required approval points:

- Requirement confirmation
- Design confirmation
- Test completion confirmation
- Change request approval

A stage cannot advance past a confirmation gate until approval is granted. Rejection returns work to the prior stage or keeps the change request unapplied.

## Document Generation

The system generates filesystem-backed documents at defined points:

- On requirement creation: requirement document
- When design reaches pending confirmation: design document
- When test reaches pending confirmation: test document

Suggested filesystem layout:

- `workspace/projects/<project-slug>/docs/requirements/`
- `workspace/projects/<project-slug>/docs/designs/`
- `workspace/projects/<project-slug>/docs/tests/`

The database stores document metadata, version, and file location. The filesystem stores the full document content.

## UX Principles

- Keep navigation shallow and direct.
- Make the dashboard useful for status, not editing.
- Put project detail at the center of day-to-day work.
- Show stage progression clearly on every requirement.
- Make approvals and change requests visible from both local detail views and global queues.

## Implementation Notes

- Start with seeded local demo data so the dashboard is meaningful.
- Prefer a small, clear schema over speculative entities.
- Keep stage definitions explicit in code instead of fully dynamic configuration for the first release.
- Design APIs and components so real task execution can be added later without rewriting page structure.
