# Story 7.3: Task Micro-Animations & Completion Animation

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **user**,
I want to see smooth animations when tasks are added, deleted, and completed,
So that interactions feel polished and satisfying.

## Acceptance Criteria

1. **Given** I add a new task **When** the task appears in the list **Then** it slides in with a smooth animation (duration under 300ms) **And** the animation uses CSS transitions (no JavaScript animation library)

2. **Given** I delete a task **When** the task is removed from the list **Then** it fades and slides out with a smooth animation (duration under 300ms) **And** the remaining tasks reflow smoothly without jarring jumps

3. **Given** I mark a task as complete **When** the hex checkbox fills **Then** a loop-de-loop bee celebration animation plays near the completed task **And** the animation is brief (under 500ms) and does not block interaction **And** the animation is CSS/SVG-based, not a GIF or video

4. **Given** the user has `prefers-reduced-motion: reduce` enabled **When** any add, delete, or completion animation would play **Then** all `transition-duration` and `animation-duration` are set to `0.01s` — state changes remain visible but happen instantly

5. **Given** micro-animations are complete **When** I run `pnpm --filter frontend test` **Then** tests verify: new task has slide-in CSS class applied, deleted task has slide-out CSS class applied, completion triggers bee animation class, prefers-reduced-motion media query is respected

## Tasks / Subtasks

- [x] Task 1: Enhance slide-in animation for new tasks (AC: #1)
  - [x] Add a CSS `@keyframes task-slide-in` animation: `from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); }`
  - [x] Duration: 250ms ease-out (under 300ms requirement)
  - [x] Track newly added task IDs in App.tsx or TaskList state to apply the animation class
  - [x] Apply `.task-item--entering` class to newly created tasks
  - [x] Remove class after animation completes (via `onAnimationEnd` or timeout)
  - [x] Place keyframes in `TaskItem.css`

- [x] Task 2: Enhance slide-out animation for deleted tasks (AC: #2)
  - [x] Existing: `.task-item--deleting` already applies `opacity: 0; transform: translateX(20px)` with 0.2s transitions
  - [x] Verify the existing delete animation meets the under-300ms requirement (0.2s = 200ms — it does)
  - [x] Ensure remaining tasks reflow smoothly — verify the delete animation completes before the DOM element is removed
  - [x] If needed, add `max-height` transition for smooth collapse: animate from current height to 0 alongside the opacity/transform
  - [x] Check that `useTodos.ts` optimistic delete timing allows the animation to play before the item is removed from the SWR cache

- [x] Task 3: Create bee completion celebration animation (AC: #3)
  - [x] Create `frontend/src/components/BeeAnimation/` folder with `index.ts`, `BeeAnimation.tsx`, `BeeAnimation.css`
  - [x] BeeAnimation component: small inline SVG bee that plays a loop-de-loop CSS animation
  - [x] The SVG should be a simplified bee (body + wings) — NOT the full bumble-bee.svg (too detailed for a micro-animation)
  - [x] CSS `@keyframes bee-loop`: a curved path animation using `transform: translate() rotate()` to simulate a loop-de-loop near the checkbox
  - [x] Duration: 400-500ms, ease-in-out
  - [x] Position: absolutely positioned relative to the TaskItem, near the HexCheckbox
  - [x] The bee appears, does the loop, then fades out
  - [x] Component auto-removes after animation completes (`onAnimationEnd`)

- [x] Task 4: Integrate BeeAnimation into TaskItem (AC: #3)
  - [x] Add state tracking for "just completed" — detect when `isCompleted` transitions from `false` to `true`
  - [x] Use `useRef` to track previous completion state and compare with current prop
  - [x] When transition detected: render `<BeeAnimation />` next to HexCheckbox
  - [x] BeeAnimation auto-cleans up after animation ends
  - [x] Do NOT trigger animation on page load for already-completed tasks
  - [x] Do NOT trigger animation when uncompleting a task (only false → true)

- [x] Task 5: Verify prefers-reduced-motion compliance (AC: #4)
  - [x] Existing: `index.css` already has blanket `transition-duration: 0.01s !important; animation-duration: 0.01s !important` under `prefers-reduced-motion: reduce`
  - [x] Verify new `@keyframes` animations respect this rule (they will — the blanket rule covers all `animation-duration`)
  - [x] Verify the bee animation is effectively invisible with 0.01s duration (state change visible, animation not)
  - [x] No additional CSS needed — the existing blanket rule handles everything

- [x] Task 6: Write tests (AC: #5)
  - [x] Test: new task renders with `.task-item--entering` class
  - [x] Test: `.task-item--entering` class is not present after animation ends
  - [x] Test: deleted task renders with `.task-item--deleting` class (existing test — verify still passes)
  - [x] Test: completing a task renders BeeAnimation component
  - [x] Test: BeeAnimation is not rendered on initial load for already-completed tasks
  - [x] Test: BeeAnimation is not rendered when uncompleting a task
  - [x] Test: prefers-reduced-motion media query sets animation-duration to 0.01s (CSS assertion)

## Dev Notes

### Architecture Compliance

- **Folder-per-component pattern**: BeeAnimation needs its own folder with `index.ts` barrel, `.tsx`, `.css` (no separate test file needed if tested via TaskItem integration tests)
- **Import via barrel**: `import { BeeAnimation } from '../components/BeeAnimation'`
- **CSS-only animations**: All animations MUST use CSS `@keyframes` and `transition` — no JavaScript animation libraries (Framer Motion, React Spring, etc.)
- **No new dependencies**: Pure CSS + React
- **Design tokens**: Use `var(--color-accent)` for bee fill colour

### Critical: Existing Animation Infrastructure

The app already has animation foundations in place. **Do NOT break or replace what exists.**

| What Exists | Location | Details |
|-------------|----------|---------|
| Delete animation | `TaskItem.css` | `.task-item--deleting` → opacity:0, translateX(20px), 0.2s ease |
| Toggle visual state | `TaskItem.css` | `.task-item--toggling` → opacity:0.7 |
| Checkbox fill transition | `HexCheckbox.css` | 0.15s fill/stroke colour transitions |
| Text completion transition | `TaskItem.css` | 0.15s colour + text-decoration |
| prefers-reduced-motion | `index.css` | Blanket 0.01s override for all animations |
| Loading skeleton pulse | `LoadingSkeleton.css` | `skeleton-pulse` @keyframes 1.5s |
| Optimistic update tracking | `useTodos.ts` | `togglingIds` Set, `deletingIds` Set |
| State props to TaskItem | `TaskList.tsx` → `TaskItem` | `isToggling`, `isDeleting` props |

### Technical Implementation Details

**Slide-in animation for new tasks:**
The challenge is knowing which task is "new." Options:
1. **Recommended**: Track newly created task IDs in App.tsx state. After `createTodo` resolves, add the returned ID to a `newTaskIds` Set. Pass this to TaskList/TaskItem. TaskItem checks if its ID is in the set and applies `.task-item--entering`. Clear from set after animation ends.
2. Alternative: Use a `useRef` in TaskList that compares previous todo count with current — but this is fragile with concurrent mutations.

The create flow is **pessimistic** (waits for server response before showing), so the task appears only after the API confirms. This means the slide-in animation triggers when the new TaskItem first mounts.

**Delete animation timing:**
The existing delete flow: user clicks delete → `isDeleting=true` applied (`.task-item--deleting` class) → optimistic SWR update removes from cache. The issue is timing — if SWR removes the item before the CSS transition completes, the animation is cut short.

Check `useTodos.ts` to verify: the `deleteTodo` function likely uses `mutate()` with optimisticData that immediately removes the item. If so, the `.task-item--deleting` class is applied but the item is removed from DOM too quickly. The fix: delay the optimistic removal by the animation duration (200ms) using `setTimeout` before calling `mutate()`, OR keep the item in the optimistic data but mark it as deleting (let the animation play, then remove on revalidation).

**Bee loop-de-loop animation:**
A simplified SVG bee (small — ~20x20px) that does a quick loop path:
```css
@keyframes bee-loop {
  0%   { transform: translate(0, 0) rotate(0deg); opacity: 1; }
  25%  { transform: translate(10px, -15px) rotate(90deg); opacity: 1; }
  50%  { transform: translate(20px, 0) rotate(180deg); opacity: 1; }
  75%  { transform: translate(10px, 15px) rotate(270deg); opacity: 0.8; }
  100% { transform: translate(0, 0) rotate(360deg); opacity: 0; }
}
```
Duration: 450ms. Position: absolute, offset from the HexCheckbox. The bee traces a small circle and fades out.

**Detecting "just completed" in TaskItem:**
```tsx
const prevCompleted = useRef(isCompleted);
const [showBeeAnimation, setShowBeeAnimation] = useState(false);

useEffect(() => {
  if (isCompleted && !prevCompleted.current) {
    setShowBeeAnimation(true);
  }
  prevCompleted.current = isCompleted;
}, [isCompleted]);

const handleBeeAnimationEnd = () => setShowBeeAnimation(false);
```
This only triggers on false→true transition, not on initial render of already-completed tasks.

### Existing Code Patterns

- **TaskItem** receives `isToggling` and `isDeleting` as boolean props from `useTodos` via TaskList
- **TaskItem** applies CSS classes conditionally: `task-item--completed`, `task-item--deleting`, `task-item--toggling`
- **HexCheckbox** is purely presentational — receives `checked` and `onChange` props
- **useTodos** manages `togglingIds` and `deletingIds` as `Set<string>` state

### What NOT To Do

- Do NOT install Framer Motion, React Spring, react-transition-group, or any animation library — CSS only
- Do NOT use the full `bumble-bee.svg` for the completion animation — it's too detailed and large; create a simplified inline SVG
- Do NOT add animations to uncomplete (true→false) — only celebrate completion
- Do NOT animate on initial page load for already-completed tasks
- Do NOT modify `useTodos.ts` unless absolutely necessary for delete timing — prefer handling animation state in component layer
- Do NOT change existing transition durations (0.15s for state changes, 0.2s for delete) — only add new animations
- Do NOT add sound effects — visual only
- Do NOT make animations longer than specified (300ms for add/delete, 500ms for bee)
- Do NOT block user interaction during any animation

### Previous Story Intelligence

**From Story 7.1 (in review — implemented):**
- Added ProgressIndicator component between BeeHeader and input area
- Created folder-per-component pattern with barrel export — follow same pattern for BeeAnimation
- 7 new tests added, total now 125 tests (88 frontend + 37 backend)
- Agent model: Claude Opus 4.6
- Debug note: `__dirname` relative paths needed careful level counting

**From Story 7.2 (in progress — keyboard navigation):**
- Adds Escape handler to TaskInput, Tab order verification, E2E keyboard test
- No animation-related changes — no conflicts expected
- May add keyboard-navigation.spec.ts to e2e/tests/

**From Story 6.2 (WCAG Audit):**
- Added `prefers-reduced-motion` blanket rule — already handles all new animations
- Component tests use `fireEvent` and `render` from React Testing Library
- CSS assertions use class checking, not snapshot testing

### Git Intelligence

Recent commits show batch-per-epic pattern. Story 7.1 is in review (implemented). Clean main branch.

### Project Structure Notes

**Files to create:**
- `frontend/src/components/BeeAnimation/index.ts`
- `frontend/src/components/BeeAnimation/BeeAnimation.tsx`
- `frontend/src/components/BeeAnimation/BeeAnimation.css`

**Files to modify:**
- `frontend/src/components/TaskItem/TaskItem.tsx` (add entering class logic, integrate BeeAnimation on completion)
- `frontend/src/components/TaskItem/TaskItem.css` (add `@keyframes task-slide-in` and `.task-item--entering` class)
- `frontend/src/App.tsx` (track newly created task IDs for slide-in animation)
- Possibly `frontend/src/hooks/useTodos.ts` (if delete timing needs adjustment for animation completion)

**Files to add tests to:**
- `frontend/src/components/TaskItem/TaskItem.test.tsx` (entering class, BeeAnimation rendering, completion-only trigger)

**Files NOT to modify:**
- `frontend/src/components/HexCheckbox/` — checkbox transitions already working
- `frontend/src/components/LoadingSkeleton/` — unrelated animation
- `frontend/src/index.css` — prefers-reduced-motion already covers everything
- Any backend files — frontend-only story

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 7.3 — Task Micro-Animations & Completion Animation]
- [Source: _bmad-output/planning-artifacts/prd.md#FR43 — Micro-animations on add/delete under 300ms]
- [Source: _bmad-output/planning-artifacts/prd.md#FR44 — Loop-de-loop bee celebration animation on completion]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Transition timing — 0.15s state changes, 0.2s spatial movement]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#prefers-reduced-motion — blanket 0.01s override]
- [Source: _bmad-output/planning-artifacts/architecture.md#Process Patterns — Optimistic toggle/delete, pessimistic create]
- [Source: frontend/src/components/TaskItem/TaskItem.css — Existing .task-item--deleting animation]
- [Source: frontend/src/hooks/useTodos.ts — togglingIds/deletingIds Sets, optimistic SWR updates]
- [Source: frontend/src/index.css — prefers-reduced-motion blanket rule]
- [Source: frontend/public/bumble-bee.svg — Existing bee SVG asset (reference only, not for animation)]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

- Delete animation timing: SWR optimisticData immediately removed items from DOM before CSS transition played. Fixed by adding 200ms delay in useTodos.ts deleteTodo before calling mutate().
- Slide-in detection: Used useEffect comparing previous and current todo IDs via useRef in App.tsx. Only marks as entering when prevTodoIdsRef has items (avoids initial load animation).

### Completion Notes List

- Task 1: Added @keyframes task-slide-in (250ms ease-out) and .task-item--entering class to TaskItem.css. Tracking new task IDs in App.tsx via useEffect comparing previous/current todo arrays. Passes enteringIds through TaskList to TaskItem. Animation class removed on animationEnd.
- Task 2: Verified existing .task-item--deleting animation (200ms) meets <300ms requirement. Added 200ms setTimeout delay in useTodos.ts deleteTodo to allow CSS transition to play before optimistic DOM removal.
- Task 3: Created BeeAnimation component (folder-per-component pattern) with simplified inline SVG bee (body + wings + stripes). CSS @keyframes bee-loop at 450ms ease-in-out with translate/rotate loop-de-loop path. Uses var(--color-accent) for bee fill.
- Task 4: Integrated BeeAnimation into TaskItem using useRef to track previous isCompleted state. Only triggers on false->true transition. Auto-removes via onAnimationEnd callback. Does not trigger on initial load or uncomplete.
- Task 5: Verified existing prefers-reduced-motion blanket rule in index.css covers all new animations (task-slide-in, bee-loop). No additional CSS needed.
- Task 6: Added 7 new tests to TaskItem.test.tsx covering: entering class applied/not applied, BeeAnimation on completion transition, no BeeAnimation on initial load, no BeeAnimation on uncomplete, onAnimationEnd callback, BeeAnimation cleanup after animation end.
- All 116 frontend tests pass (26 TaskItem tests including 7 new). All 37 backend tests pass. No regressions.

### File List

- frontend/src/components/BeeAnimation/index.ts (new)
- frontend/src/components/BeeAnimation/BeeAnimation.tsx (new)
- frontend/src/components/BeeAnimation/BeeAnimation.css (new)
- frontend/src/components/TaskItem/TaskItem.tsx (modified)
- frontend/src/components/TaskItem/TaskItem.css (modified)
- frontend/src/components/TaskItem/TaskItem.test.tsx (modified)
- frontend/src/components/TaskList/TaskList.tsx (modified)
- frontend/src/App.tsx (modified)
- frontend/src/hooks/useTodos.ts (modified — delete delay 300ms, respects prefers-reduced-motion)
- frontend/src/components/TaskList/TaskList.css (modified — smooth height collapse on delete via :has())
- frontend/src/design-system.test.ts (modified — prefers-reduced-motion CSS assertion test)

## Change Log

- 2026-03-12: Implemented task micro-animations (slide-in for new tasks, delete timing fix) and bee completion celebration animation. Added BeeAnimation component, integrated into TaskItem with completion transition detection. 7 new tests added.
- 2026-03-12: Code review fixes — (H1) added prefers-reduced-motion CSS assertion test to design-system.test.ts, (H2) added smooth height collapse on delete via :has(.task-item--deleting) in TaskList.css + increased delete timeout to 300ms, (M1) replaced hardcoded SVG colors in BeeAnimation with CSS variables (var(--color-text), var(--color-bee-wing)), (M2) delete timeout now respects prefers-reduced-motion (0ms when active). All 118 frontend tests pass.
