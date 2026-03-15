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

## Verify

```bash
npm run test -- --run
npm run lint
npm run build
```

## Workspace Documents

Generated requirement documents are written under:

`/tmp/softfactory-workspace/projects/<project-slug>/docs/requirements/`

You can override the workspace root with `SOFTFACTORY_WORKSPACE_ROOT` in `.env`.
