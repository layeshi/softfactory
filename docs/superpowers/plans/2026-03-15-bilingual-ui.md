# Bilingual UI Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Chinese and English UI support with a persistent language switcher, defaulting to Chinese, without changing stored business data or generated document content.

**Architecture:** Add a lightweight in-repo translation system driven by a server-readable locale cookie. Server pages read locale from cookies, build a translator object, and pass translated UI text into components; a small locale API endpoint updates the cookie when the user switches languages.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript, cookie-based locale persistence, Vitest, React Testing Library

---

## File Structure

### New i18n layer

- Create: `lib/i18n/messages.ts`
- Create: `lib/i18n/get-locale.ts`
- Create: `lib/i18n/get-translator.ts`

### New interaction endpoint and UI

- Create: `app/api/locale/route.ts`
- Create: `components/layout/language-switcher.tsx`

### Existing files to modify

- Modify: `app/layout.tsx`
- Modify: `app/page.tsx`
- Modify: `app/projects/page.tsx`
- Modify: `app/projects/new/page.tsx`
- Modify: `app/projects/[projectId]/page.tsx`
- Modify: `app/projects/[projectId]/requirements/[requirementId]/page.tsx`
- Modify: `app/documents/page.tsx`
- Modify: `app/approvals/page.tsx`
- Modify: `components/layout/app-shell.tsx`
- Modify: `components/layout/sidebar-nav.tsx`
- Modify: `components/dashboard/metric-card.tsx`
- Modify: `components/dashboard/status-panel.tsx`
- Modify: `components/projects/project-form.tsx`
- Modify: `components/projects/project-list.tsx`
- Modify: `components/requirements/requirement-form.tsx`
- Modify: `components/requirements/stage-timeline.tsx`
- Modify: `components/change-requests/change-request-form.tsx`
- Modify: `components/documents/document-list.tsx`
- Modify: `components/approvals/approval-list.tsx`
- Modify: `lib/utils.ts`

### Tests

- Create: `tests/unit/i18n.test.ts`
- Create: `tests/unit/locale-route.test.ts`
- Modify: `tests/components/project-list.test.tsx`
- Modify: `tests/components/stage-timeline.test.tsx`
- Create: `tests/components/sidebar-nav.test.tsx`

## Chunk 1: Locale Core

### Task 1: Add locale parsing and translation dictionaries

**Files:**
- Create: `lib/i18n/messages.ts`
- Create: `lib/i18n/get-locale.ts`
- Create: `lib/i18n/get-translator.ts`
- Test: `tests/unit/i18n.test.ts`

- [ ] **Step 1: Write the failing i18n tests**

```ts
import { resolveLocale } from "@/lib/i18n/get-locale";
import { getTranslator } from "@/lib/i18n/get-translator";

test("defaults to zh when locale is missing", () => {
  expect(resolveLocale(undefined)).toBe("zh");
});

test("returns English labels when locale is en", () => {
  const t = getTranslator("en");
  expect(t.layout.nav.projects).toBe("Projects");
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm run test -- tests/unit/i18n.test.ts --run`
Expected: FAIL with missing i18n module

- [ ] **Step 3: Implement locale helpers and messages**

Implement:
- locale type union: `zh | en`
- locale parser with default fallback to `zh`
- typed message dictionaries for layout, dashboard, pages, forms, and statuses

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm run test -- tests/unit/i18n.test.ts --run`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add lib/i18n/messages.ts lib/i18n/get-locale.ts lib/i18n/get-translator.ts tests/unit/i18n.test.ts
git commit -m "feat: add bilingual translation core"
```

### Task 2: Add locale switch API and switcher component

**Files:**
- Create: `app/api/locale/route.ts`
- Create: `components/layout/language-switcher.tsx`
- Modify: `components/layout/app-shell.tsx`
- Test: `tests/unit/locale-route.test.ts`

- [ ] **Step 1: Write the failing locale route tests**

```ts
import { POST } from "@/app/api/locale/route";

test("writes zh locale cookie", async () => {
  const response = await POST(
    new Request("http://localhost/api/locale", {
      method: "POST",
      body: JSON.stringify({ locale: "zh" }),
    }),
  );

  expect(response.status).toBe(200);
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm run test -- tests/unit/locale-route.test.ts --run`
Expected: FAIL with missing route

- [ ] **Step 3: Implement locale API and switcher**

Implement:
- locale validation for `zh` and `en`
- cookie write on success
- compact language switcher button group
- switcher placement in the shared app shell header

- [ ] **Step 4: Run tests**

Run: `npm run test -- tests/unit/locale-route.test.ts --run`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add app/api/locale/route.ts components/layout/language-switcher.tsx components/layout/app-shell.tsx tests/unit/locale-route.test.ts
git commit -m "feat: add locale switcher and cookie endpoint"
```

## Chunk 2: UI Translation Integration

### Task 3: Translate shared layout and dashboard UI

**Files:**
- Modify: `app/layout.tsx`
- Modify: `app/page.tsx`
- Modify: `components/layout/sidebar-nav.tsx`
- Modify: `components/dashboard/metric-card.tsx`
- Modify: `components/dashboard/status-panel.tsx`
- Create: `tests/components/sidebar-nav.test.tsx`

- [ ] **Step 1: Write failing shared UI translation tests**

```tsx
import { render, screen } from "@testing-library/react";
import { SidebarNav } from "@/components/layout/sidebar-nav";

test("renders Chinese nav labels", () => {
  render(<SidebarNav labels={{ dashboard: "仪表盘", projects: "项目" }} />);
  expect(screen.getByText("仪表盘")).toBeInTheDocument();
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm run test -- tests/components/sidebar-nav.test.tsx --run`
Expected: FAIL with incompatible props or missing test file

- [ ] **Step 3: Implement translated shared components**

Implement:
- pass translated labels from server pages into layout shell
- sidebar labels and brand description come from translator
- dashboard cards and snapshot labels come from translator

- [ ] **Step 4: Run tests**

Run: `npm run test -- tests/components/sidebar-nav.test.tsx tests/components/home-page.test.tsx --run`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add app/layout.tsx app/page.tsx components/layout/sidebar-nav.tsx components/dashboard/metric-card.tsx components/dashboard/status-panel.tsx tests/components/sidebar-nav.test.tsx tests/components/home-page.test.tsx
git commit -m "feat: localize shared layout and dashboard"
```

### Task 4: Translate page-specific forms and lists

**Files:**
- Modify: `app/projects/page.tsx`
- Modify: `app/projects/new/page.tsx`
- Modify: `app/projects/[projectId]/page.tsx`
- Modify: `app/projects/[projectId]/requirements/[requirementId]/page.tsx`
- Modify: `app/documents/page.tsx`
- Modify: `app/approvals/page.tsx`
- Modify: `components/projects/project-form.tsx`
- Modify: `components/projects/project-list.tsx`
- Modify: `components/requirements/requirement-form.tsx`
- Modify: `components/requirements/stage-timeline.tsx`
- Modify: `components/change-requests/change-request-form.tsx`
- Modify: `components/documents/document-list.tsx`
- Modify: `components/approvals/approval-list.tsx`
- Modify: `lib/utils.ts`
- Modify: `tests/components/project-list.test.tsx`
- Modify: `tests/components/stage-timeline.test.tsx`

- [ ] **Step 1: Expand failing component tests**

```tsx
test("renders Chinese blocked status badge", () => {
  render(
    <ProjectList
      locale="zh"
      labels={...}
      projects={[{ status: "blocked", ... }]}
    />,
  );

  expect(screen.getByText("阻塞")).toBeInTheDocument();
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm run test -- tests/components/project-list.test.tsx tests/components/stage-timeline.test.tsx --run`
Expected: FAIL with old English-only rendering

- [ ] **Step 3: Implement translated forms and lists**

Implement:
- all page titles and descriptions localized
- all form labels, buttons, and helper text localized
- status and stage values rendered from translator dictionaries, not `titleizeStatus()`

- [ ] **Step 4: Run tests**

Run: `npm run test -- tests/components/project-list.test.tsx tests/components/stage-timeline.test.tsx --run`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add app/projects/page.tsx app/projects/new/page.tsx app/projects/[projectId]/page.tsx app/projects/[projectId]/requirements/[requirementId]/page.tsx app/documents/page.tsx app/approvals/page.tsx components/projects/project-form.tsx components/projects/project-list.tsx components/requirements/requirement-form.tsx components/requirements/stage-timeline.tsx components/change-requests/change-request-form.tsx components/documents/document-list.tsx components/approvals/approval-list.tsx lib/utils.ts tests/components/project-list.test.tsx tests/components/stage-timeline.test.tsx
git commit -m "feat: localize project requirement and operations ui"
```

## Chunk 3: Final Verification

### Task 5: Verify bilingual behavior end to end

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Update README**

Include:
- supported locales
- locale default behavior
- how the cookie-based switcher works

- [ ] **Step 2: Run the full verification suite**

Run: `npm run test -- --run`
Expected: PASS

Run: `npm run lint`
Expected: PASS

Run: `npm run build`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add README.md
git commit -m "docs: document bilingual ui behavior"
```

## Execution Notes

- Use `@superpowers:test-driven-development` before each production change.
- Keep translation keys grouped and typed to prevent silent drift.
- Do not translate database content or generated document bodies in this plan.
