# Security Review Report — todo

**Date:** 2026-03-12
**Reviewer:** Dev Agent (Claude Opus 4.6)
**Scope:** OWASP Top 10 assessment of full-stack todo application

## Executive Summary

The todo application demonstrates a strong security posture for its scope as a single-user local development tool. All critical and high severity vectors (XSS, SQL injection) are mitigated by framework-level protections. Two medium severity findings (missing security headers, unbounded input length) were identified and remediated during this review.

## Methodology

- Static code analysis of frontend (React + Vite), backend (Fastify + Drizzle ORM), and shared packages
- OWASP Top 10 (2021) checklist review against all application code
- Dependency vulnerability audit (`pnpm audit`) across all workspaces
- Container configuration review (Dockerfiles, docker-compose.yml, nginx.conf)

## Findings Summary

| # | Category | Severity | Description | Status |
|---|----------|----------|-------------|--------|
| 1 | A03 Injection (XSS) | Info | XSS vectors assessed — React default escaping in place | No action needed |
| 2 | A03 Injection (SQL) | Info | SQL injection vectors assessed — Drizzle ORM parameterised queries | No action needed |
| 3 | A05 Security Misconfiguration | Medium | Missing security headers in nginx.conf | **Remediated** |
| 4 | A03 Injection (Input) | Medium | No maxLength on todo text input (TypeBox schema and HTML) | **Remediated** |
| 5 | A06 Vulnerable Components | Moderate | esbuild transitive dependency vulnerability (dev-only) | Accepted risk |
| 6 | A01 Broken Access Control | Info | No authentication — by design (MVP scope) | Accepted risk |
| 7 | A02 Cryptographic Failures | Info | No sensitive data stored — no encryption needed | N/A |
| 8 | A07 Authentication Failures | Info | No authentication — excluded by PRD | Accepted risk |
| 9 | A08 Data Integrity | Info | TypeBox validates all incoming JSON — no untrusted deserialization | No action needed |
| 10 | A09 Logging & Monitoring | Info | Fastify Pino logger active (`logger: true`) | No action needed |
| 11 | A10 SSRF | Info | No outbound HTTP requests from backend | N/A |

## Detailed Findings

### Finding 1: XSS Vector Assessment (Info — No Action Needed)

**Evidence:**
- `frontend/src/components/TaskItem/TaskItem.tsx:53` — `{todo.text}` rendered via React JSX default escaping
- `frontend/src/components/ErrorMessage/ErrorMessage.tsx:10` — `{message}` rendered as plain text
- `frontend/src/api/todoApi.ts` — JSON responses parsed via `response.json()`, no HTML/JS interpretation
- No usage of `dangerouslySetInnerHTML`, `eval()`, or `Function()` anywhere in the frontend codebase

**Conclusion:** XSS is effectively mitigated by React's default text escaping and typed API responses.

### Finding 2: SQL Injection Assessment (Info — No Action Needed)

**Evidence:**
- `backend/src/todo.service.ts` — All database operations use Drizzle ORM query builder methods (`.select()`, `.insert()`, `.update()`, `.delete()`) with parameterised values
- No raw SQL strings or string concatenation in any query
- `backend/src/db.ts` — Uses Drizzle client wrapping a `pg.Pool` connection; no direct SQL execution exposed
- `backend/src/todo.routes.ts` — TypeBox schema validation on all mutating routes:
  - `CreateTodoBody`: `Type.String({ minLength: 1, maxLength: 500 })`
  - `ToggleTodoBody`: `Type.Boolean()`
  - `TodoParams`: `Type.String({ format: 'uuid' })`

**Conclusion:** SQL injection is effectively mitigated by Drizzle ORM parameterised queries and TypeBox input validation.

### Finding 3: Missing Security Headers (Medium — Remediated)

**Description:** The `frontend/nginx.conf` reverse proxy configuration had no security headers, leaving the application without standard browser-side protections.

**Remediation Applied:** Added the following security headers to `frontend/nginx.conf`:
```nginx
add_header X-Content-Type-Options "nosniff" always;
add_header X-Frame-Options "DENY" always;
add_header X-XSS-Protection "0" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Content-Security-Policy "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self'" always;
```

**Notes:**
- `X-XSS-Protection: 0` is the modern recommendation — the old `1; mode=block` caused its own vulnerabilities. CSP replaces it.
- `'unsafe-inline'` for `style-src` is required for Google Fonts `<link>` tag and Vite-injected styles.
- `data:` in `img-src` covers any inline SVG data URIs.

**Code Review Fix (2026-03-12):** The static assets `location` block (`location ~* \.(js|css|...)`) had its own `add_header Cache-Control`, which per nginx's `add_header` inheritance rules silently overrode all security headers from the parent `server` block. Security headers were repeated in the static assets location block to ensure they are sent for all responses.

### Finding 4: Unbounded Input Length (Medium — Remediated)

**Description:** The `CreateTodoBody` TypeBox schema had `minLength: 1` but no `maxLength`, allowing arbitrarily long task descriptions to be submitted and stored.

**Remediation Applied:**
- `backend/src/todo.routes.ts` — Added `maxLength: 500` to `CreateTodoBody` TypeBox schema. Fastify's schema validation automatically returns 400 for text exceeding 500 characters.
- `frontend/src/components/TaskInput/TaskInput.tsx` — Added `maxLength={500}` to the `<input>` element for client-side enforcement.

**Tests Added:**
- `backend/src/todo.routes.test.ts` — Test for 400 response when text exceeds 500 characters
- `frontend/src/components/TaskInput/TaskInput.test.tsx` — Test verifying `maxLength` attribute on input element

### Finding 5: esbuild Transitive Dependency Vulnerability (Moderate — Accepted Risk)

**Description:** `pnpm audit` reports 1 moderate vulnerability in `esbuild` (<=0.24.2) via the dependency chain: `backend > drizzle-kit > @esbuild-kit/esm-loader > @esbuild-kit/core-utils > esbuild`.

**Advisory:** GHSA-67mh-4wv8-2f99 — esbuild enables any website to send requests to the development server and read the response.

**Risk Assessment:** This is a development-only tool dependency (`drizzle-kit` is used for database migrations, not at runtime). The vulnerability affects esbuild's dev server, which is not used in this project's production deployment. No action required.

## Accepted Risks

| Item | Rationale |
|------|-----------|
| No Authentication | PRD explicitly excludes auth from MVP. Single-user, no sensitive data. Not a vulnerability — intentional design decision. |
| No CORS Headers | In dev: Vite proxy handles it. In Docker: nginx reverse proxy on same origin. No cross-origin access needed. |
| No Rate Limiting | Single-user local app. No public deployment. |
| No HTTPS | Local development only. Docker deployment is localhost. |
| Weak Default DB Credentials in .env.example | Example values for local development, not production. README documents changing them. |
| No CSRF Protection | Single-user local application with no authentication. CSRF protection requires an authenticated session to be meaningful. |

## Dependency Audit Results

```
Root workspace:
  1 moderate vulnerability (esbuild via drizzle-kit)

Backend:
  1 moderate vulnerability (same esbuild transitive dependency)

Frontend:
  1 moderate vulnerability (same esbuild transitive dependency)

E2E:
  1 moderate vulnerability (same esbuild transitive dependency)

Total: 1 unique moderate vulnerability (dev dependency only)
No critical or high severity vulnerabilities found.
```

## Container Security Notes

- Multi-stage Docker builds in use (build stage → production stage)
- Frontend container runs nginx as non-root
- Backend container runs as `node` user (non-root)
- Health checks configured in docker-compose.yml
- No secrets in Dockerfiles — environment variables passed via `.env` file

## Conclusion

The todo application has **zero unresolved critical or high severity findings**. Two medium severity issues (missing security headers and unbounded input length) were identified and remediated during this review. One moderate dependency vulnerability exists in a dev-only transitive dependency and is accepted as a non-production risk.

The application's security posture is appropriate for its scope as a single-user local development tool, with framework-level protections (React XSS escaping, Drizzle ORM parameterised queries, TypeBox input validation) providing effective defense against common web vulnerabilities.
