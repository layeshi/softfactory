# Bilingual UI Design

## Overview

This document defines the bilingual user interface enhancement for the local software factory console. The goal is to support Chinese and English UI text with a user-controlled language switcher, while preserving the existing data model, generated document content, and seeded business data.

## Goals

- Support both Chinese and English for all user-facing interface text.
- Provide a clear language switcher in the top layout area.
- Persist the selected language across the site.
- Default the application to Chinese.
- Render the correct language on the first server response without client-side flicker.

## Non-Goals

- Translating database content.
- Translating generated requirement, design, or test documents.
- Translating seed data or persisted business records.
- Adding a third-party i18n framework.

## Scope

The bilingual enhancement applies only to interface text:

- Navigation labels
- Page titles and descriptions
- Cards and dashboard labels
- Form labels and button text
- Empty states and helper copy
- Status badge display text

## Architecture

### Locale Source

Use a `locale` cookie with allowed values:

- `zh`
- `en`

If the cookie is absent or invalid, fall back to `zh`.

### Rendering Model

Read the locale on the server for every page request. Use that locale to resolve UI strings before rendering. This preserves correct first paint and avoids showing English before switching to Chinese or vice versa.

### Translation System

Add a local translation layer:

- `lib/i18n/messages.ts`
- `lib/i18n/get-locale.ts`
- `lib/i18n/get-translator.ts`

The translator returns strings from in-repo dictionaries rather than calling any external service or framework.

### Language Switching

Add a UI control in the layout shell:

- `中文`
- `English`

When the user selects a language:

1. Send a request to a locale API endpoint
2. Write the `locale` cookie
3. Refresh or rerender the current route

## Component Boundaries

### Files That Must Use Translations

- `app/page.tsx`
- `app/projects/page.tsx`
- `app/projects/new/page.tsx`
- `app/projects/[projectId]/page.tsx`
- `app/projects/[projectId]/requirements/[requirementId]/page.tsx`
- `app/documents/page.tsx`
- `app/approvals/page.tsx`
- `components/layout/sidebar-nav.tsx`
- `components/layout/app-shell.tsx`
- `components/dashboard/*`
- `components/projects/*`
- `components/requirements/*`
- `components/change-requests/*`
- `components/documents/*`
- `components/approvals/*`

### Files That Must Remain Unchanged in Meaning

- Prisma schema
- business enums
- persisted statuses in database rows
- generated document bodies

## Status Translation Rules

Internal status values remain unchanged. Display values become localized through translation keys.

Examples:

- `draft`
- `in_progress`
- `blocked`
- `pending`
- `completed`
- `requirement`
- `design`
- `development`

The UI must not rely on `titleizeStatus()` for status labels once localization is introduced. Status labels should come from dictionary lookups.

## Data Flow

### Server Pages

1. Read locale from cookie
2. Build translator object
3. Pass translated labels into layout and presentational components

### Client Interaction

1. User clicks language switcher
2. Client posts selected locale to API
3. API writes cookie
4. Client refreshes current page

## Testing

### Unit Tests

- locale parsing defaults to Chinese
- locale parsing accepts English cookie
- translator returns Chinese and English values correctly

### Component Tests

- sidebar shows Chinese labels under `zh`
- sidebar shows English labels under `en`
- project list status badges localize correctly
- stage timeline labels localize correctly

### API Tests

- locale endpoint accepts `zh`
- locale endpoint accepts `en`
- locale endpoint writes the cookie
- locale endpoint rejects invalid locale values

## UX Notes

- Keep the switcher visible but not loud.
- The switcher should feel like a system control, not a marketing toggle.
- Chinese is the default language and should appear naturally integrated into the existing design.
- English should remain first-class and not look like a fallback.

## Implementation Notes

- Prefer a typed translation dictionary so missing keys are easier to catch.
- Keep translation keys grouped by domain: layout, dashboard, projects, requirements, approvals, documents, status.
- Avoid sprinkling string literals across pages after this change; user-visible text should come from the translator layer.
