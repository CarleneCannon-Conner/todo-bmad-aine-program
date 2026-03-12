# Story 6.3: Security Review & Documentation

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **developer**,
I want a security review documenting findings and remediations,
So that common vulnerabilities are identified and addressed before deployment.

## Acceptance Criteria

1. **Given** the application codebase **When** I conduct an OWASP top 10 review **Then** XSS vectors are assessed — all user input is sanitised or safely rendered (React's default escaping, TypeBox backend validation) **And** injection vectors are assessed — parameterised queries via Drizzle ORM, no raw SQL **And** any other relevant OWASP categories are checked (CSRF, security headers, dependency vulnerabilities)

2. **Given** the review is complete **When** findings exist **Then** each finding is documented with severity (critical/high/medium/low), description, and remediation applied **And** zero critical or high severity findings remain unresolved

3. **Given** the security review is complete **When** I inspect the deliverables **Then** a security review report is produced in `_bmad-output/implementation-artifacts/` **And** the report lists all findings, their severities, and remediations applied

## Tasks / Subtasks

- [ ] Task 1: Conduct XSS vector assessment (AC: #1)
  - [ ] Audit all user input rendering paths in React components
  - [ ] Verify no `dangerouslySetInnerHTML`, `eval()`, or `Function()` usage
  - [ ] Verify React's default text escaping is in place for `todo.text` in `TaskItem.tsx`
  - [ ] Verify error messages in `ErrorMessage.tsx` are rendered as plain text
  - [ ] Verify `todoApi.ts` does not interpret HTML/JS from API responses
  - [ ] Document finding: XSS is mitigated by React's default escaping + typed API responses

- [ ] Task 2: Conduct injection vector assessment (AC: #1)
  - [ ] Audit all database queries in `todo.service.ts` — verify Drizzle ORM parameterised queries only
  - [ ] Verify no raw SQL strings or string concatenation in queries
  - [ ] Verify `db.ts` uses Drizzle client with connection pooling, no direct SQL execution
  - [ ] Verify TypeBox schema validation on all mutating routes (`todo.routes.ts`) — `CreateTodoBody` (minLength:1), `TodoParams` (UUID format)
  - [ ] Document finding: SQL injection mitigated by Drizzle ORM parameterised queries + TypeBox input validation

- [ ] Task 3: Assess remaining OWASP Top 10 categories (AC: #1)
  - [ ] **A01 Broken Access Control:** Document that authentication is deliberately excluded from MVP (PRD decision, not a vulnerability). No sensitive data exposed. Single-user app by design.
  - [ ] **A02 Cryptographic Failures:** No sensitive data stored (no passwords, no PII beyond task text). No encryption needed for MVP scope.
  - [ ] **A05 Security Misconfiguration:** Check for security headers — assess nginx.conf and Fastify app for missing headers (X-Content-Type-Options, X-Frame-Options, etc.)
  - [ ] **A06 Vulnerable Components:** Run `pnpm audit` in root, backend, and frontend directories. Document any vulnerabilities found and severity levels.
  - [ ] **A07 Authentication Failures:** N/A — no auth by design (document this explicitly)
  - [ ] **A08 Data Integrity Failures:** Verify no deserialization of untrusted data. TypeBox validates all incoming JSON.
  - [ ] **A09 Logging & Monitoring:** Verify Fastify Pino logger is active (`logger: true` in app.ts). Document current logging coverage.
  - [ ] **A10 SSRF:** N/A — no outbound HTTP requests from backend

- [ ] Task 4: Assess and remediate security headers (AC: #1, #2)
  - [ ] Audit current nginx.conf for missing security headers
  - [ ] Add security headers to nginx.conf: `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `X-XSS-Protection: 0` (modern standard — CSP replaces this), `Referrer-Policy: strict-origin-when-cross-origin`
  - [ ] Add basic `Content-Security-Policy` to nginx.conf: `default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self'`
  - [ ] Note: `'unsafe-inline'` for style-src is needed because Vite injects styles in dev mode and Google Fonts link tag is in index.html

- [ ] Task 5: Assess and remediate input length limits (AC: #1, #2)
  - [ ] Current state: TypeBox `CreateTodoBody` has `minLength: 1` but no `maxLength`
  - [ ] Add `maxLength: 500` to `CreateTodoBody` TypeBox schema in `todo.routes.ts` (reasonable limit for a task description)
  - [ ] Add corresponding `maxLength={500}` to the `<input>` element in `TaskInput.tsx` for client-side enforcement
  - [ ] Drizzle schema uses `text()` type — no DB-level limit needed (text type is unbounded in PostgreSQL, application-level limit is sufficient)

- [ ] Task 6: Run dependency vulnerability audit (AC: #1, #2)
  - [ ] Run `pnpm audit` from project root
  - [ ] Run `pnpm --filter backend audit`
  - [ ] Run `pnpm --filter frontend audit`
  - [ ] Run `pnpm --filter e2e audit`
  - [ ] Document all findings with severity levels
  - [ ] Remediate any critical or high severity vulnerabilities (upgrade packages)
  - [ ] Document any medium/low findings that are accepted risks

- [ ] Task 7: Produce security review report (AC: #3)
  - [ ] Create `_bmad-output/implementation-artifacts/security-review-report.md`
  - [ ] Structure: Executive Summary, Methodology, Findings Table (ID, Category, Severity, Description, Status, Remediation), Detailed Findings, Accepted Risks, Conclusion
  - [ ] Include all findings from Tasks 1-6
  - [ ] Confirm zero critical/high severity findings remain unresolved
  - [ ] Include dependency audit results

- [ ] Task 8: Update tests if code changes were made (AC: #2)
  - [ ] If maxLength was added to TypeBox schema: add test in `todo.routes.test.ts` for 400 response on text > 500 chars
  - [ ] If maxLength was added to TaskInput: add test in `TaskInput.test.tsx` verifying maxLength attribute
  - [ ] Run `pnpm -r test` — all existing tests still pass

- [ ] Task 9: Final verification (AC: #1, #2, #3)
  - [ ] Security review report exists at `_bmad-output/implementation-artifacts/security-review-report.md`
  - [ ] All findings documented with severity and remediation
  - [ ] Zero critical or high severity findings unresolved
  - [ ] `pnpm -r test` — all tests pass
  - [ ] No breaking changes introduced by security remediations

## Dev Notes

### Architecture Compliance

**Source:** [architecture.md — Authentication & Security]

Architecture doc states:
- **MVP:** No authentication — single user, no sensitive data
- **Future-proofing:** User_id deferred entirely — no stub column for MVP
- **Input validation:** TypeBox on all mutating endpoints prevents injection

This story is a **review and documentation** exercise. The scope is: assess, document findings, remediate critical/high issues, and produce a report. It is NOT about adding authentication or major security infrastructure.

### Current Security Posture (from codebase analysis)

**Already Protected:**

| Vector | Protection | Status |
|--------|-----------|--------|
| XSS | React default escaping, no `dangerouslySetInnerHTML` | Safe |
| SQL Injection | Drizzle ORM parameterised queries, no raw SQL | Safe |
| Input Validation | TypeBox on all mutating routes, frontend trim+empty check | Safe |
| Container Security | Multi-stage builds, non-root users (`node`, `nginx`) | Safe |
| Error Info Leak | Generic "Internal server error" on 500, structured responses | Safe |
| Logging | Fastify Pino logger active (`logger: true`) | In place |

**Needs Remediation (Medium severity):**

| Issue | Current State | Remediation |
|-------|--------------|-------------|
| Security Headers | No security headers in nginx.conf | Add X-Content-Type-Options, X-Frame-Options, CSP, Referrer-Policy |
| Input Length | No maxLength on todo text (TypeBox or HTML) | Add maxLength: 500 to TypeBox schema + input element |

**Accepted Risks (by design, not vulnerabilities):**

| Item | Rationale |
|------|-----------|
| No Authentication | PRD explicitly excludes auth from MVP. Single-user, no sensitive data. |
| No CORS headers | In dev: Vite proxy handles it. In Docker: nginx reverse proxy on same origin. No cross-origin access needed. |
| No Rate Limiting | Single-user local app. No public deployment. |
| No HTTPS | Local development only. Docker deployment is localhost. |
| Weak default DB creds in .env.example | Example values, not production. README documents changing them. |

### nginx.conf Security Headers

Current `nginx.conf` has no security headers. Add to the `server` block:

```nginx
# Security headers
add_header X-Content-Type-Options "nosniff" always;
add_header X-Frame-Options "DENY" always;
add_header X-XSS-Protection "0" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Content-Security-Policy "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self'" always;
```

Notes:
- `X-XSS-Protection: 0` is the modern recommendation — the old `1; mode=block` caused its own vulnerabilities. CSP replaces it.
- `'unsafe-inline'` for style-src is required because Google Fonts `<link>` tag and possibly Vite-injected styles.
- `data:` in img-src is needed if any inline SVGs use data URIs.

### TypeBox maxLength Addition

In `todo.routes.ts`, the `CreateTodoBody` schema currently has:
```typescript
const CreateTodoBody = Type.Object({
  text: Type.String({ minLength: 1 })
});
```

Change to:
```typescript
const CreateTodoBody = Type.Object({
  text: Type.String({ minLength: 1, maxLength: 500 })
});
```

TypeBox will automatically return a 400 validation error for text exceeding 500 characters. No additional error handling code needed — Fastify's schema validation catches it.

In `TaskInput.tsx`, add `maxLength={500}` to the `<input>` element for client-side enforcement.

### Security Review Report Template

The report should follow this structure:

```markdown
# Security Review Report — todo

**Date:** 2026-03-XX
**Reviewer:** [Dev Agent]
**Scope:** OWASP Top 10 assessment of full-stack todo application

## Executive Summary
[1-2 sentences on overall security posture]

## Methodology
- Static code analysis of frontend, backend, shared packages
- OWASP Top 10 checklist review
- Dependency vulnerability audit (`pnpm audit`)
- Container configuration review

## Findings Summary

| # | Category | Severity | Description | Status |
|---|----------|----------|-------------|--------|
| 1 | ... | ... | ... | Remediated / Accepted |

## Detailed Findings
[Each finding with full description, evidence, remediation]

## Accepted Risks
[Items excluded by design with rationale]

## Dependency Audit Results
[Output of pnpm audit]

## Conclusion
[Confirmation of zero unresolved critical/high findings]
```

### Previous Story Intelligence

**From Story 6.2 (immediate predecessor):**
- Added keyboard navigation and ARIA attributes to frontend components
- Added `@axe-core/playwright` to e2e package
- Created `e2e/tests/accessibility.spec.ts`
- Updated CSS design tokens for WCAG contrast compliance
- No security-relevant changes

**From Story 6.1:**
- Added `@vitest/coverage-v8` and coverage configuration
- Test counts: backend 36, frontend 71, total 107 unit/integration tests
- Coverage thresholds at 70% for both packages

**Key code locations for security review:**
- `backend/src/todo.routes.ts` — route handlers with TypeBox validation
- `backend/src/todo.service.ts` — business logic with Drizzle queries
- `backend/src/app.ts` — Fastify app factory, plugin registration, error handler
- `backend/src/db.ts` — Drizzle client as Fastify plugin
- `frontend/src/api/todoApi.ts` — single API boundary, fetch wrapper
- `frontend/src/components/TaskItem/TaskItem.tsx` — user text rendering
- `frontend/nginx.conf` — reverse proxy configuration
- `shared/schema.ts` — Drizzle table definitions
- `shared/types.ts` — API contract types
- `docker-compose.yml` — container orchestration
- `.env.example` — environment variable documentation

### What NOT To Do

- Do NOT add authentication — explicitly excluded from MVP by PRD
- Do NOT add rate limiting — single-user local app, no public deployment
- Do NOT add HTTPS/TLS — local development context only
- Do NOT install Helmet.js in Fastify — add security headers in nginx.conf instead (headers belong at the reverse proxy layer for this architecture)
- Do NOT add CORS middleware — the nginx reverse proxy handles same-origin serving
- Do NOT change the database schema — no security-relevant schema changes needed
- Do NOT add `eslint-plugin-security` or other static analysis tools — out of scope
- Do NOT create findings for intentional design decisions (no auth = accepted risk, not a vulnerability)
- Do NOT over-scope remediation — only fix critical/high findings; document medium/low

### Project Structure Notes

- Modified: `frontend/nginx.conf` (add security headers)
- Modified: `backend/src/todo.routes.ts` (add maxLength: 500 to CreateTodoBody)
- Modified: `frontend/src/components/TaskInput/TaskInput.tsx` (add maxLength={500} to input)
- Modified: `backend/src/todo.routes.test.ts` (add test for maxLength validation)
- Modified: `frontend/src/components/TaskInput/TaskInput.test.tsx` (add test for maxLength attribute)
- New: `_bmad-output/implementation-artifacts/security-review-report.md` (security review deliverable)
- No new source components — minimal code changes, primarily a documentation deliverable

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 6.3 — Security Review & Documentation]
- [Source: _bmad-output/planning-artifacts/prd.md#FR38 — Security review completed for common issues]
- [Source: _bmad-output/planning-artifacts/prd.md#Security NFR — Zero unresolved critical/high findings]
- [Source: _bmad-output/planning-artifacts/architecture.md#Authentication & Security — no auth MVP, TypeBox validation]
- [Source: _bmad-output/planning-artifacts/architecture.md#API & Communication Patterns — 4 endpoints, ApiResponse envelope]
- [Source: _bmad-output/planning-artifacts/architecture.md#Implementation Patterns — Service/Route boundary, error handling]
- [Source: backend/src/todo.routes.ts — TypeBox schemas, route handlers]
- [Source: backend/src/todo.service.ts — Drizzle ORM queries, no raw SQL]
- [Source: backend/src/app.ts — Fastify app factory, error handler, Pino logger]
- [Source: frontend/nginx.conf — reverse proxy config, no security headers currently]
- [Source: docker-compose.yml — container orchestration, health checks]
- [Source: .env.example — environment variable documentation]
- [Source: project-context.md — training Step 4 quality assurance requirements]

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List
