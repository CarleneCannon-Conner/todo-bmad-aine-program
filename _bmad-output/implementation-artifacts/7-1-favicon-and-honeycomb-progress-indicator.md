# Story 7.1: Favicon & Honeycomb Progress Indicator

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **user**,
I want to see the bee in my browser tab and know my progress at a glance,
So that the app feels like mine and I can see how much I've accomplished.

## Acceptance Criteria

1. **Given** the app is loaded in a browser tab **When** I view the browser tab **Then** the existing bumble bee SVG is displayed as the favicon **And** the favicon is referenced in `index.html` using a standard `<link rel="icon">` tag

2. **Given** tasks exist in the list (some complete, some incomplete) **When** I view the app **Then** a honeycomb-styled progress indicator displays "X/Y complete" (e.g. "5/8 complete") **And** the indicator uses the bee theme palette (`--color-accent`, `--color-text`)

3. **Given** I complete or uncomplete a task **When** the task state changes **Then** the progress indicator updates immediately to reflect the new count

4. **Given** all tasks are deleted (empty list) **When** I view the app **Then** the progress indicator is hidden (no "0/0" display)

5. **Given** the favicon and progress indicator are complete **When** I run `pnpm --filter frontend test` **Then** tests verify: favicon link exists in index.html, progress indicator renders correct X/Y count, indicator updates on task toggle, indicator is hidden when list is empty

## Tasks / Subtasks

- [x] Task 1: Replace default Vite favicon with bee SVG (AC: #1)
  - [x] Update `frontend/index.html`: change `<link rel="icon" type="image/svg+xml" href="/vite.svg" />` to `<link rel="icon" type="image/svg+xml" href="/bumble-bee.svg" />`
  - [x] Verify `frontend/public/bumble-bee.svg` exists (it does — used by BeeHeader)
  - [x] Optionally remove `frontend/public/vite.svg` if no longer referenced

- [x] Task 2: Create ProgressIndicator component (AC: #2, #3, #4)
  - [x] Create `frontend/src/components/ProgressIndicator/` folder with `index.ts`, `ProgressIndicator.tsx`, `ProgressIndicator.css`, `ProgressIndicator.test.tsx`
  - [x] Component props: `{ completedCount: number, totalCount: number }`
  - [x] Render "X/Y complete" text with honeycomb styling
  - [x] Include a small honeycomb/hex SVG icon alongside the text for visual alignment with the bee theme
  - [x] Use `--color-accent` and `--color-text` design tokens
  - [x] Return `null` when `totalCount === 0` (hide on empty list)

- [x] Task 3: Integrate ProgressIndicator into App (AC: #2, #3, #4)
  - [x] Import ProgressIndicator in `App.tsx`
  - [x] Compute `completedCount` and `totalCount` from the `todos` array in App
  - [x] Place the indicator between `BeeHeader` and the task input area (inside `CardShell`)
  - [x] Indicator updates reactively because it derives from the same `todos` state via `useTodos`

- [x] Task 4: Write tests (AC: #5)
  - [x] Test: ProgressIndicator renders "3/5 complete" for given props
  - [x] Test: ProgressIndicator renders `null` when totalCount is 0
  - [x] Test: ProgressIndicator renders "0/3 complete" when no tasks are done
  - [x] Test: ProgressIndicator renders "3/3 complete" when all tasks are done
  - [x] Test: favicon link in index.html points to `/bumble-bee.svg`

## Dev Notes

### Architecture Compliance

- **Folder-per-component pattern**: ProgressIndicator must follow the established pattern — own folder with `index.ts` barrel, `.tsx`, `.css`, `.test.tsx`
- **Import via barrel**: `import { ProgressIndicator } from '../components/ProgressIndicator'`
- **CSS custom properties only**: Use `var(--color-accent)`, `var(--color-text)` — no hardcoded colours
- **No new dependencies**: Pure CSS + React. No animation libraries, no extra packages
- **Responsive**: Component must work at both mobile (full-bleed) and desktop (560px card) widths

### Technical Implementation Details

**Favicon change** is a one-line edit in `frontend/index.html`:
```html
<!-- Current (line 5): -->
<link rel="icon" type="image/svg+xml" href="/vite.svg" />
<!-- Change to: -->
<link rel="icon" type="image/svg+xml" href="/bumble-bee.svg" />
```
The file `bumble-bee.svg` already exists in `frontend/public/` and is served at the root path. No build configuration change needed.

**ProgressIndicator component** receives derived data as props — it does NOT call any API or hook. The computation happens in `App.tsx`:
```tsx
const completedCount = todos.filter(t => t.isCompleted).length;
const totalCount = todos.length;
```
This follows the existing pattern where `App.tsx` is the single bridge between `useTodos` and child components — data flows down via props.

**Honeycomb styling** — use a small inline SVG hexagon icon beside the text. Keep it simple: a single `<svg>` with a hexagon `<polygon>` filled with `var(--color-accent)`. This aligns with the existing HexCheckbox visual language without duplicating its full complexity.

**Placement in App.tsx** — insert between `<BeeHeader />` and the input area, inside `<CardShell>`. Approximate location:
```tsx
<CardShell>
  <ProgressIndicator completedCount={completedCount} totalCount={totalCount} />
  {/* existing TaskInput + AddButton + ErrorMessage + TaskList */}
</CardShell>
```

### Existing Code Patterns to Follow

- **BeeHeader** (`frontend/src/components/BeeHeader/BeeHeader.tsx`): Simple presentational component, imports CSS module, uses image from public folder
- **HexCheckbox** (`frontend/src/components/HexCheckbox/HexCheckbox.tsx`): Inline SVG with hexagon polygon — reference for hex styling
- **TaskList** (`frontend/src/components/TaskList/TaskList.tsx`): Conditional rendering based on data state (empty state pattern)
- **App.tsx**: Central composition — derives state from `useTodos()`, passes props to children

### Testing Approach

- Use Vitest + React Testing Library (same as all other component tests)
- Test the ProgressIndicator component in isolation with mock props
- For the favicon test, read `frontend/index.html` content and assert the link href (same approach used in `design-system.test.ts` for CSS token validation)
- No E2E tests required for this story (per acceptance criteria)

### What NOT To Do

- Do NOT create a custom hook for progress counting — it's a simple derived value in App.tsx
- Do NOT use any animation library — this story has no animation requirements
- Do NOT modify `useTodos.ts` — the hook already returns all data needed
- Do NOT add any backend changes — this is frontend-only
- Do NOT add a progress bar — the requirement is text-based "X/Y complete" with honeycomb styling
- Do NOT show "0/0 complete" — hide the indicator when list is empty
- Do NOT modify the existing design tokens — use them as-is

### Previous Story Intelligence

**From Epic 6 (most recent completed epic):**
- Story 6.2 added WCAG AA contrast-adjusted tokens (already in `index.css`): `--color-placeholder: #826B4F`, `--color-done-text: #7A6D5B`, `--color-input-border: #A08862`, `--color-hex-stroke: #9A8250`
- Story 6.2 added keyboard navigation, ARIA attributes, `:focus-visible` styling, and `prefers-reduced-motion` support
- Story 6.1 configured `@vitest/coverage-v8` with 70% thresholds — new tests will contribute to coverage
- Current test counts: 118 unit/integration tests (37 backend + 81 frontend), 12 E2E tests
- Agent model used across Epic 6: Claude Opus 4.6

**Patterns established:**
- Component tests mock `todoApi` via `vi.mock('../api/todoApi')`
- SWR is used for server state — test utilities use `SWRConfig` with `provider: () => new Map()` to prevent cache leaks between tests
- CSS assertions use computed styles or class checking, not snapshot testing

### Git Intelligence

Recent commits show batch-per-epic pattern:
- `83d1975` complete sixth epic
- `d9a32f2` complete fifth epic
- `323ff1c` complete fourth epic and some bug fixes

No partial work or WIP branches detected. Clean main branch.

### Project Structure Notes

**Files to create:**
- `frontend/src/components/ProgressIndicator/index.ts`
- `frontend/src/components/ProgressIndicator/ProgressIndicator.tsx`
- `frontend/src/components/ProgressIndicator/ProgressIndicator.css`
- `frontend/src/components/ProgressIndicator/ProgressIndicator.test.tsx`

**Files to modify:**
- `frontend/index.html` (favicon href change)
- `frontend/src/App.tsx` (import ProgressIndicator, compute counts, render)

**Files to optionally clean up:**
- `frontend/public/vite.svg` (remove if no longer referenced anywhere)

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 7.1 — Favicon & Honeycomb Progress Indicator]
- [Source: _bmad-output/planning-artifacts/prd.md#FR40 — Browser tab favicon using existing bumble bee SVG]
- [Source: _bmad-output/planning-artifacts/prd.md#FR42 — Honeycomb-styled progress indicator showing X/Y complete]
- [Source: _bmad-output/planning-artifacts/architecture.md#Frontend Architecture — folder-per-component with barrel exports]
- [Source: _bmad-output/planning-artifacts/architecture.md#Naming Conventions — PascalCase components]
- [Source: _bmad-output/planning-artifacts/architecture.md#Implementation Patterns — CSS custom properties, design tokens]
- [Source: frontend/index.html — Current favicon: vite.svg (line 5)]
- [Source: frontend/src/components/BeeHeader/BeeHeader.tsx — Bee SVG loaded from /bumble-bee.svg]
- [Source: frontend/src/index.css — 12 design tokens in :root]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

- Fixed favicon test path: `__dirname` relative path needed 3 levels up (not 4) to reach `frontend/index.html`

### Completion Notes List

- Task 1: Replaced Vite favicon with bumble-bee.svg in index.html, removed unused vite.svg from public/
- Task 2: Created ProgressIndicator component following folder-per-component pattern with barrel export, inline hex SVG icon, CSS custom properties only, returns null on empty list
- Task 3: Integrated ProgressIndicator in App.tsx between BeeHeader and input area, deriving completedCount/totalCount from todos state
- Task 4: Added 7 tests (6 component + 1 favicon) — all passing. Full suite: 88 frontend + 37 backend = 125 tests, 0 failures

### Change Log

- 2026-03-12: Implemented Story 7.1 — favicon changed to bumble-bee.svg, ProgressIndicator component created and integrated, 7 new tests added
- 2026-03-12: Code review fixes — added role="status" for accessibility live region, removed redundant SVG stroke, added 4 integration tests in App.test.tsx (X/Y count, toggle update, hidden on empty, visible with todos)

### File List

- frontend/index.html (modified — favicon href changed to bumble-bee.svg)
- frontend/public/vite.svg (deleted — no longer referenced)
- frontend/src/App.tsx (modified — import ProgressIndicator, compute counts, render)
- frontend/src/App.test.tsx (modified — added ProgressIndicator integration tests)
- frontend/src/components/ProgressIndicator/index.ts (created — barrel export)
- frontend/src/components/ProgressIndicator/ProgressIndicator.tsx (created — component, role="status")
- frontend/src/components/ProgressIndicator/ProgressIndicator.css (created — styles)
- frontend/src/components/ProgressIndicator/ProgressIndicator.test.tsx (created — 7 tests including role="status" check)
