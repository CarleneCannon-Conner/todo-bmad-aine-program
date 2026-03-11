# Project Context

This file provides shared context for all BMAD personas working on this project. Read this before asking for additional context.

---

## What This Project Is

This is a **tutorial/learning project**. The goal is to apply the BMAD Spec-Driven Development methodology end-to-end, not to build a production product. The deliverable is both a working Todo application and documented learnings about the BMAD process.

The project owner is **Carlene**. She is working through this as a personal learning exercise following company training instructions (see below).

---

## Decision Priority Rules

When making any design, architecture, or implementation decision, apply this priority order:

1. **Original PRD** (see below) — highest authority
2. **Explicit decision made or chosen by Carlene** — if she has stated a preference or made a choice, it stands
3. **Anything else** — if a decision cannot be traced directly to the original PRD or an explicit choice by Carlene, it is likely an assumption. Flag it and ask Carlene to decide. She will then prioritise it as one of:
   - MVP
   - Post-MVP
   - Nice to have
   - Irrelevant

Do not silently assume. Do not proceed without traceability.

---

## Original PRD

The following is the original PRD provided as part of the training instructions. It is the source of truth for product requirements.

> Product Requirement Document (PRD) for the Todo App
>
> The goal of this project is to design and build a simple full-stack Todo application that allows individual users to manage personal tasks in a clear, reliable, and intuitive way. The application should focus on clarity and ease of use, avoiding unnecessary features or complexity, while providing a solid technical foundation that can be extended in the future if needed.
>
> From a user perspective, the application should allow the creation, visualisation, completion, and deletion of todo items. Each todo represents a single task and should include a short textual description, a completion status, and basic metadata such as creation time. Users should be able to immediately see their list of todos upon opening the application and interact with it without any onboarding or explanation.
>
> The frontend experience should be fast and responsive, with updates reflected instantly when the user performs an action such as adding or completing a task. Completed tasks should be visually distinguishable from active ones to clearly communicate status at a glance. The interface should work well across desktop and mobile devices and include sensible empty, loading, and error states to maintain a polished user experience.
>
> The backend will expose a small, well-defined API responsible for persisting and retrieving todo data. This API should support basic CRUD operations and ensure data consistency and durability across user sessions. While authentication and multi-user support are not required for the initial version, the architecture should not prevent these features from being added later if the product evolves.
>
> From a non-functional standpoint, the system should prioritise simplicity, performance, and maintainability. Interactions should feel instantaneous under normal conditions, and the overall solution should be easy to understand, deploy, and extend by future developers. Basic error handling is expected both client-side and server-side to gracefully handle failures without disrupting the user flow.
>
> The first version of the application intentionally excludes advanced features such as user accounts, collaboration, task prioritisation, deadlines, or notifications. These capabilities may be considered in future iterations, but the initial delivery should remain focused on delivering a clean and reliable core experience.
>
> Success for this project will be measured by the ability of a user to complete all core task-management actions without guidance, the stability of the application across refreshes and sessions, and the clarity of the overall user experience. The final result should feel like a complete, usable product despite its deliberately minimal scope.

---

## Training Instructions Summary

The company instructions require the following 4-step process:

1. **Initialize BMAD & Generate Specifications** — PM/PRD, Architecture, UX Design, Stories, Test Strategy
2. **Build the Application** — with QA integrated from day one (unit, integration, E2E)
3. **Containerize with Docker Compose** — Dockerfiles, docker-compose.yml, health checks, environment config
4. **Quality Assurance Activities** — test coverage (min 70%), performance, accessibility (WCAG AA), security review

**Deliverables required:**
- BMAD artifacts (project brief, architecture docs, stories with acceptance criteria)
- Working Todo application (frontend + backend)
- Unit, integration, and E2E test suites (min 5 passing Playwright tests)
- Dockerfiles and docker-compose.yml
- QA reports (coverage, accessibility, security review)
- README with setup instructions
- AI integration log (documenting agent usage, MCP servers, test generation, debugging, limitations)
