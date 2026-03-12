# Learning BMAD Notes

Personal observations and learnings from working through the BMAD framework on the Todo App project. This document also serves as the project's AI Integration Log, fulfilling the Phase 3 documentation requirement to capture: agent usage, MCP server usage, test generation, debugging with AI, and limitations encountered.

---

## Setup & Environment

- Took some time to set up due to not using my NF for a while and my version of node was out of date.

### Tips for Setup

- Put your original PRD and any key context into a project-context.md — each new persona can then be pointed to it rather than having to copy and paste large amounts of text each time.
- Explicitly tell BMAD to ignore any personal notes files that are not relevant to the application being built.

---

## Process Overview

Steps being followed (company instructions):
1. Initialize BMAD & Generate Specifications (PM, Architect, Stories, Test Strategy)
2. Build the Application (with QA integrated from day one)
3. Containerize with Docker Compose
4. Quality Assurance Activities

---

## Step 1: Specifications

### PM Agent / PRD Creation

- I made a mistake when I first started — I gave it the PRD included with the instructions and ran the validate persona, thinking we had a PRD so I didn't need to create one. I expected it to run through the PRD so I could fill in/alter things. I was mistaken. I started again with the correct create PRD persona and fed it the PRD provided.
- I noticed I needed to explicitly ask it to refer to the original PRD so as not to go off script. Also to let me know any assumptions or contradictions as we stepped through, to prevent it making assumptions. I will likely do a similar thing with the other personas.

### PRD Validation

- After creating the PRD with the PM agent, the validate-prd workflow was used to check for gaps and inconsistencies against the original PRD.
- The validation process caught several assumptions the PM agent had introduced — features not present in the original brief were flagged and either removed or explicitly marked as post-MVP.
- Key lesson: always validate generated artifacts against the original source material. The AI tends to expand scope during creation, and validation is the safety net.

### Architecture

- Architect phase, as predicted, I needed to remind it to use both the original PRD and the created one as a reference and not to assume. It made a lot of assumptions. I am now going through it step by step to clarify.
- When debating in architecture mode with the various personas, it can get rather heated — much like real life! ;D
- The personas are great at explaining their choices of tech when asked to justify their choice or asked to compare, or asked for more detail of what that tech does and/or its impact on other tech choices.
- I find AI can be quite opinionated, sometimes not offering me a choice of tech, and when questioned, eventually agreeing that their solution, for instance, was overkill — once presented with an opinion of my own.
- Questioning via party mode can give some good insight into other tech and is a good way of questioning the AI's initial decisions.
- So much reading.
- Strange — it gave me 2 options, I chose one and it asked if I was sure. I then party moded it and it tried again to convince me of the option I didn't choose. Ultimately it doesn't make a big difference, but a funny hill for BMAD to die on.

### UX Design

- Asking for emotional responses is interesting. This works well if you are in fact the designer or asking on behalf of the client. However, it can contradict the original PRD, so interesting decisions can end up being made.
- Asking about my feelings about the same thing for the third time is too much. And because it asks so many times, I am likely to have slightly different answers, and sometimes it puts that into its own words — a flippant comment can turn into a bigger deal due to potential misunderstanding. Like it is now a contradiction. Do I prefer feeling x or feeling y? "But you said you liked y more earlier, and now you like x." And so on.
- Going through the different HTML mockups that are generated was a good experience. I could specify particular changes and compare and contrast. I could also go into party mode and have the results of those mocked up as well. Overall enjoyed this part of the process — very quick. And the mockups have a good level of usability, so I could identify where focus goes if I hit tab etc.
- A real issue — a lot of assumptions were made without establishing a layout. What I had in my head was clearly different from BMAD. But because BMAD had not explicitly explained that it had made an assumption, I asked a question in party mode that was 'obvious' to John the project manager. *"I assumed it would look like other todo apps I used."* Which is fine, I'd expect AI to use examples, but it at no point presented me with that layout to agree to or not. Only now does it occur to BMAD that perhaps we should explore layout. Strange. Perhaps if I'd provided UX layouts from the get go it would base it on that and BMAD would have a back and forth with me to clarify layout. But because, by using this tutorial, I didn't have one from the get go, it seems it is allowed to assume. This is an incredibly frustrating thing to find out and I had to find a way to jump out of the flow to 'go back' to establish layout. I might not have noticed if I'd followed the flow blindly. Now it's asking me what step I'd like to do the layout part in. I don't know — this is the first time I've used BMAD. Surely there is a step dedicated to layout? So it did some analysis and essentially it only ever ran me through 5 steps out of 14. To be clear, at no point did I volunteer to exit the UX workflow, nor did it say how many steps in total there would be — it just told me which step we were on. In fact, it said something like "ok, move onto create epics" without any indication that steps had been skipped. Also, when I moved onto create epics, I did ask it to clarify if all other steps were completed before I started.

### Stories & Test Strategy

- The SM agent created epics and stories from the validated PRD and architecture documents. 6 epics were planned with 22 stories total, plus 2 bug fix stories discovered during implementation.
- Epic breakdown: (1) Foundation & Scaffolding — 4 stories, (2) Core CRUD Operations — 4 stories, (3) Visual Design & Bee Theme — 4 stories, (4) Error Handling — 2 stories, (5) Docker & Containerization — 3 stories, (6) QA & Documentation — 4 stories.
- Test strategy was embedded into each story's acceptance criteria and tasks — no separate test strategy document was generated. Tests were written as part of the dev-story workflow using red-green-refactor.
- The create-story workflow produced comprehensive story files with Dev Notes sections containing architecture requirements, coding patterns, and previous story learnings — this gave the Dev agent rich context for implementation.

---

## Step 2: Implementation

- For sprint planning, dev, and review I went YOLO mode. As advised by BMAD, I used another model to review the code.
- Found a bug in development — attempting to create a bug story to see what happens. It created a new bug story successfully that I was able to run the dev and review commands on as usual. However, it doesn't come up in sprint status.
- Ah, because the bug isn't in sprint planning, it couldn't be found by the command `code review`. However, I simply told it there is a bug, so it searched for it.
- Found a second bug. This time when I reported it, I let BMAD know it hadn't tracked the previous bug. It fixed this error — now both bugs are tracked in sprint-status.yaml. So `code review` should work this time.
- Completed MVP. Moving onto post-MVP by running `/bmad-bmm-edit-prd`.
- Post-MVP is challenging because it is mixing up actual requirements with the 'feelings questions' it asked previously. It's hard for me to keep track. One of the feelings questions I am referring to is "What Makes This Special", which led me down the path to give the todo app a bee theme — it isn't in either the original PRD or the instructions for this create-todo-app-with-BMAD task.

---

## Step 3: Docker / Containerization

- Epic 5 covered containerization across 3 stories: Dockerfiles (5.1), docker-compose orchestration (5.2), and compose profiles with environment configuration (5.3).
- Multi-stage Docker builds were used for both frontend (build → nginx) and backend (build → production Node.js). Both containers run as non-root users for security.
- Three compose profiles were created: `prod` (built images, nginx serving), `dev` (volume-mounted with hot reload), and `test` (isolated database for test runs).
- Notable challenge: Docker daemon was not available on the development machine during implementation. Dockerfiles and compose configurations were verified structurally but could not be runtime-tested by the Dev agent. This was documented in story completion notes.
- The `drizzle-kit` dependency (used for database migrations) is a devDependency, which required a separate installation step in the production Docker stage to run migrations on container startup.

---

## Step 4: QA

- Epic 6 covered quality assurance across 4 stories: test coverage (6.1), accessibility audit (6.2), security review (6.3), and this AI integration log (6.4).
- **Test coverage (6.1):** Installed `@vitest/coverage-v8` and configured 70% coverage thresholds for both backend and frontend packages. Final counts: 37 backend tests, 81 frontend tests (118 total unit/integration), plus 12 Playwright E2E tests.
- **Accessibility (6.2):** Installed `@axe-core/playwright` for automated WCAG AA auditing. Added keyboard navigation (Enter/Space to toggle, Delete/Backspace to remove tasks), ARIA attributes (`role="checkbox"`, `aria-checked`, `aria-label`), and updated CSS design tokens for contrast compliance. Created `e2e/tests/accessibility.spec.ts`.
- **Security review (6.3):** Conducted full OWASP Top 10 assessment. Two medium findings were remediated: missing security headers in nginx.conf (added CSP, X-Frame-Options, etc.) and unbounded input length (added maxLength: 500). Zero critical/high findings. Produced a comprehensive security review report.
- Overall, the QA phase was efficient because tests had been written alongside implementation from Epic 1 onwards — the QA stories mostly involved adding tooling, auditing, and documenting rather than writing tests from scratch.

---

## General Observations

- BMAD doesn't always offer you options such as party mode, so you need to remember this is in fact an option.
- I am using AI to keep track of my notes in a somewhat ordered manner as I work through the tutorial.
- The longer I work on this, the more tempting it is to just accept BMAD's default suggestions — wouldn't recommend this for a single sitting. Feels overkill for a little app like this but I can see the value in a larger project. Also it is likely different people with different roles will work with BMAD at the different stages. I could see a world where this tool is an assistant to be used during the typical meetings that would normally take place to discuss each of these stages.
- I wonder if you could end up going around in circles or either 'bully' or 'be bullied' into a specific tech stack or design decision. Sometimes, BMAD changes its tune if I'm adamant even without any evidence to support my reasoning.
- BMAD is able to, when asked, provide me with where a decision came from e.g. original PRD, explicit decision made by myself, something I agreed to, or an assumption BMAD made. I can then ask it to prioritise which is for MVP, post MVP or just nice to have, quoting source if necessary.
- This is useful to keep track of after a mountain of questions and decision fatigue. Particularly for an original PRD I did not author. I could easily go off track assuming the decision came from the original PRD when it didn't.
- I kept having to remind each new persona to refer to the old PRD for initial context. I ended up putting it into a project-context.md that I could easily refer to, to save me copying and pasting huge amounts of text. (See Tips for Setup.)
- I also had to explicitly ask BMAD not to refer to this learning notes document. It isn't relevant — it's just for me. (See Tips for Setup.)
- BMAD keeps getting confused between overall BMAD context and persona-level context. I keep needing to be specific despite opening the appropriate personas.
- Jumping back into a previous persona can cause mismatches. I was correctly instructed to use the edit persona to make sure all personas were up to date.

---

## AI Integration Log

The following sections document how AI tools were used throughout this project, fulfilling the training requirement for an AI integration log.

### AI Agent Usage

**Framework:** BMAD Method v6.0.4 (installed via `_bmad/` directory). BMAD provides a spec-driven development methodology with specialized agent personas, workflow engines, and structured artifact generation.

**AI Model:** Claude Opus 4.6 (`claude-opus-4-6`) via Claude Code CLI — used consistently across all personas and all 24 stories (22 stories + 2 bug fixes).

**BMAD Personas Used:**

| Persona | Tasks Performed |
|---------|----------------|
| PM Agent | PRD creation from original brief, PRD validation |
| Architect Agent | Architecture decision document (tech stack, API design, data model) |
| UX Designer Agent | UX design specification, HTML mockups, design tokens |
| SM Agent | Sprint planning, epic/story breakdown, story creation (create-story workflow) |
| Dev Agent | Story implementation across all 6 epics + 2 bug fixes (dev-story workflow) |
| QA / Code Review Agent | Code review after each story (code-review workflow, different LLM recommended) |

**Workflow Pattern:** The core implementation cycle was: `create-story` (SM agent produces a context-rich story file) → `dev-story` (Dev agent implements following red-green-refactor) → `code-review` (QA agent reviews with fresh context). YOLO mode was used during sprint planning, dev, and review to reduce manual confirmation steps.

**Planning Artifacts Generated:**
- `_bmad-output/planning-artifacts/prd.md` — Product Requirements Document
- `_bmad-output/planning-artifacts/architecture.md` — Architecture Decision Document
- `_bmad-output/planning-artifacts/ux-design-specification.md` — UX Design Specification
- `_bmad-output/planning-artifacts/epics.md` — Epics and Stories Breakdown

### MCP Server Usage

No MCP (Model Context Protocol) servers were used during this project. Claude Code CLI provides built-in tool access for file operations, shell commands, and code search, which was sufficient for all implementation tasks. No external tool integrations (databases, APIs, third-party services) were connected via MCP.

### Test Generation Approach

**Method:** Tests were generated by the Dev agent as part of the dev-story workflow. Each story's tasks followed a red-green-refactor cycle: write failing tests first, implement minimal code to pass, then refactor.

**Frameworks:**
- **Unit/Integration:** Vitest with `@testing-library/react` for frontend component tests, Vitest with Fastify's `app.inject()` for backend route/service tests
- **E2E:** Playwright for end-to-end browser tests
- **Coverage:** `@vitest/coverage-v8` with 70% threshold for both packages

**Testing Patterns:**
- Tests co-located with source files (e.g., `TaskItem.test.tsx` alongside `TaskItem.tsx`)
- Frontend tests mock at the `todoApi` boundary — components tested with real React rendering but mocked API calls
- Backend tests use a real PostgreSQL test database — no mocking of the data layer
- E2E tests in `e2e/` directory cover core user flows (CRUD operations, theme verification, accessibility)

**Final Test Counts:** 118 unit/integration tests (37 backend, 81 frontend), 12 Playwright E2E tests.

### Debugging Cases

**Bug Fixes Tracked in Sprint:**

1. **bug-tasklist-border-bottom** — Visual bug where the task list had an unwanted bottom border. Discovered during implementation, tracked as a bug story in `sprint-status.yaml`, and resolved through the standard dev-story → code-review cycle.

2. **bug-tasklist-margin-top** — Visual bug with incorrect top margin on the task list. Same discovery and resolution pattern. Initially, bug stories were not tracked in sprint status — this was corrected after the second bug was reported.

**AI Debugging Instances from Story Files:**

- **Epic 1 (Foundation):** `@sinclair/typebox` not bundled with Fastify 5.x — required separate installation. `loadEnv` not exported from Vitest 4.x — workaround with hardcoded test DATABASE_URL. PostgreSQL 14 library linking issues on macOS.
- **Story 1.3:** SWR cache leaking between frontend tests — fixed with isolated `SWRConfig` wrapper per test.
- **Story 4.1:** TypeScript error handler needed `FastifyError` type annotation. Test files compiled into `dist/` caused duplicate test runs — fixed with tsconfig exclusions.
- **Epic 5 (Docker):** Docker daemon unavailable on dev machine — configurations verified structurally but not runtime-tested. `drizzle-kit` as devDependency required separate production-stage installation.
- **Story 6.3:** Two pre-existing flaky backend tests (database state isolation in delete and sort order tests) — identified as not caused by security story changes.

### Limitations Encountered

**Context Window Management:** Each new conversation starts without memory of previous sessions. The `project-context.md` file was created as a mitigation — providing shared context that any persona could reference. Story files with comprehensive Dev Notes sections also helped carry context between sessions.

**Persona Confusion Across Sessions:** BMAD kept getting confused between overall framework context and persona-level context. Switching between personas (e.g., from Architect to SM to Dev) required explicit reminders about which artifacts to reference. The edit-prd workflow was needed to ensure all personas stayed synchronized after changes.

**Assumption-Making Tendencies:** AI agents frequently introduced assumptions not present in the original PRD. This was observed across PM (scope expansion), Architect (opinionated tech choices), and UX Designer (layout assumptions without confirmation) personas. Mitigation: explicit instructions to flag assumptions, use of `project-context.md` with decision priority rules, and party mode for cross-persona questioning.

**UX Workflow Step Skipping:** The UX Designer agent ran through only 5 of 14 workflow steps without indicating steps were being skipped. Layout was never explicitly discussed or confirmed — the agent assumed a standard todo app layout. This was only discovered when a party mode question revealed the assumption.

**Decision Fatigue and Acceptance Bias:** Over long sessions, there was increasing temptation to accept AI default suggestions without questioning. The BMAD framework's thoroughness (many detailed questions, emotional response prompts) contributed to this fatigue, particularly for a small-scope application.

**Docker Runtime Verification:** Docker daemon was unavailable during Epic 5 implementation. All Dockerfiles and compose configurations were written and verified structurally but could not be runtime-tested by the Dev agent.

### Project Summary

| Metric | Value |
|--------|-------|
| Total Epics | 6 |
| Total Stories | 22 + 2 bug fixes |
| AI Model | Claude Opus 4.6 (all stories) |
| Unit/Integration Tests | 118 (37 backend, 81 frontend) |
| E2E Tests | 12 (Playwright) |
| Test Coverage Target | 70% (both packages) |
| WCAG Compliance | AA (zero critical violations) |
| Security Findings | 0 critical/high, 2 medium (remediated) |
| BMAD Version | 6.0.4 |
| Framework | React + Vite (frontend), Fastify + Drizzle ORM (backend), PostgreSQL |
