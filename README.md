# Softfactory

Single-user local web console for software project intake, structured requirement tracking, change requests, approvals, and generated requirement documents.

## Language Support

- Default locale: Chinese (`zh`)
- Supported locales: Chinese (`zh`) and English (`en`)
- Switch language from the top-right toggle in the shared page header
- The selected locale is stored in a `locale` cookie and reused across the site

## Prerequisites

- Node.js 22+
- npm 10+

## Setup

```bash
npm install
cp .env.example .env
npm run prisma:generate
npx prisma db push
npm run db:seed
```

## Run

```bash
npm run dev
```

Open `http://localhost:3000`.

## Worker

Phase 2 adds a local execution worker for requirement runs.

```bash
npm run worker
```

The worker claims one queued run, prepares its local run directory, writes `task.json`, and processes the next stages.

## Execution Runner Modes

- Default mode: `fake`
- Reserved adapter mode: `real`

The fake runner writes deterministic logs, result snapshots, and markdown artifacts without needing Claude Code. To switch modes:

```bash
SOFTFACTORY_EXECUTION_RUNNER=real npm run worker
```

The real adapter now exists as the integration boundary, but still needs final local Claude Code command wiring before it can execute real tasks.

## Verify

```bash
npm run test -- --run
npm run lint
DATABASE_URL=file:/tmp/softfactory-dev.db npm run build
```

## Workspace Documents

Generated requirement documents are written under:

`/tmp/softfactory-workspace/projects/<project-slug>/docs/requirements/`

You can override the workspace root with `SOFTFACTORY_WORKSPACE_ROOT` in `.env`.
