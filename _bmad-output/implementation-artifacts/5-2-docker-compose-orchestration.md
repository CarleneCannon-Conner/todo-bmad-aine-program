# Story 5.2: Docker Compose Orchestration

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **developer**,
I want a single `docker-compose up` command to start the entire application,
so that I can run the full stack without manually starting each service.

## Acceptance Criteria

1. **Given** a fresh clone with Docker installed **When** I run `docker-compose up` **Then** three containers start: frontend, backend, and PostgreSQL database **And** the backend connects to the database and runs migrations automatically **And** the frontend is accessible at `http://localhost:5173` (or configured port) **And** the backend API is accessible through the frontend proxy **And** the application is fully functional (add, toggle, delete todos)

2. **Given** the docker-compose.yml **When** I inspect the configuration **Then** containers are networked so frontend can reach backend and backend can reach the database **And** PostgreSQL data is persisted via a named volume **And** environment variables are configured via `.env` files or compose environment block **And** `.env.example` is updated with Docker-specific variable documentation

3. **Given** the containers are running **When** I run `docker-compose ps` **Then** all three containers show as healthy **And** health checks are configured for backend (via `/api/health`) and database (via `pg_isready`)

4. **Given** the containers are running **When** I run `docker-compose logs` **Then** logs from all containers are accessible **And** backend Pino logs are visible in the output

5. **Given** the containers are running **When** I perform all CRUD operations (add, toggle, delete) through the browser **Then** all operations work end-to-end through containerised services **And** data persists across `docker-compose down` and `docker-compose up` cycles (via named volume)

6. **Given** the docker-compose.yml is complete **When** I run `docker-compose down` then `docker-compose up` **Then** previously created todos are still present (volume persistence verified)

## Tasks / Subtasks

- [x] Task 1: Create `docker-compose.yml` at monorepo root (AC: #1, #2, #3)
  - [x] Define three services: `db` (PostgreSQL), `backend` (Fastify), `frontend` (nginx)
  - [x] Use the Dockerfiles from Story 5.1 for backend and frontend builds
  - [x] Set build context to `.` (monorepo root) with `dockerfile` pointing to each service's Dockerfile
  - [x] Configure default network (Docker Compose auto-creates one)
  - [x] Define named volume `pgdata` for PostgreSQL persistence

- [x] Task 2: Configure PostgreSQL service (`db`) (AC: #2, #3, #5, #6)
  - [x] Use `postgres:16-alpine` image
  - [x] Set environment: `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD` from `.env` or defaults
  - [x] Mount named volume `pgdata` to `/var/lib/postgresql/data`
  - [x] Add health check: `pg_isready -U ${POSTGRES_USER} -d ${POSTGRES_DB}`
  - [x] Configure `restart: unless-stopped`

- [x] Task 3: Configure backend service (AC: #1, #2, #3, #4)
  - [x] Build from `backend/Dockerfile` with context `.`
  - [x] Set environment: `DATABASE_URL` pointing to `db` service (e.g., `postgresql://user:pass@db:5432/todo`), `PORT=3000`
  - [x] Add `depends_on: db: condition: service_healthy`
  - [x] Add health check: `wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1`
  - [x] Configure `restart: unless-stopped`
  - [x] Run migrations on startup (add migration command to backend startup or use entrypoint script)

- [x] Task 4: Configure frontend service (AC: #1, #2)
  - [x] Build from `frontend/Dockerfile` with context `.`
  - [x] Map port `5173:80` (nginx internal port 80 → host port 5173 matching dev port)
  - [x] Add `depends_on: backend: condition: service_healthy`
  - [x] Configure `restart: unless-stopped`

- [x] Task 5: Handle automatic database migrations on backend startup (AC: #1)
  - [x] Option A (preferred): Created `backend/docker-entrypoint.sh` that runs `npx drizzle-kit migrate` then starts server
  - [x] Ensure migrations are idempotent (safe to re-run on existing database) — Drizzle tracks applied migrations
  - [x] Drizzle migration files included in Docker image (copy `backend/drizzle/` in Dockerfile)

- [x] Task 6: Update `.env.example` with Docker-specific documentation (AC: #2)
  - [x] Add Docker-specific variables: `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`
  - [x] Document `DATABASE_URL` format for Docker networking (uses `db` service name)
  - [x] Add comments distinguishing local dev vs Docker environment variables

- [x] Task 7: Update backend Dockerfile for migration support (AC: #1)
  - [x] Copy `backend/drizzle/` directory (migration SQL files) into the production stage
  - [x] Copy `backend/drizzle.config.ts` for migration command
  - [x] Installed `drizzle-kit` separately in production stage via `pnpm add -w drizzle-kit`

- [ ] Task 8: Verify full end-to-end workflow (AC: #1, #3, #4, #5, #6)
  - [ ] Docker daemon not running — needs manual `docker-compose up --build` verification
  - [x] All 107 tests pass (36 backend + 71 frontend), zero regressions
  - [x] docker-compose.yml structure matches Dev Notes pattern exactly

- [x] Task 9: Update README with Docker usage instructions (AC: #2)
  - [x] Add "Running with Docker" section
  - [x] Document: `docker-compose up` to start, `docker-compose down` to stop
  - [x] Document: `docker-compose logs` for log access
  - [x] Document: `docker-compose down -v` to reset data
  - [x] Note that first build may take a few minutes

## Dev Notes

### Architecture Compliance

**Source:** [architecture.md — Infrastructure & Deployment]

**Architecture states:** "architecture designed to not prevent Docker Compose orchestration" — this story fulfills that deferred decision.

**Key architectural constraints:**
- Backend port: 3000 (Fastify default, confirmed in architecture)
- Database: PostgreSQL (Drizzle ORM, confirmed in architecture)
- Frontend: SPA served via nginx (from Story 5.1)
- API proxy: nginx proxies `/api/` to `http://backend:3000` (from Story 5.1 nginx.conf)
- Logging: Fastify Pino built-in (`logger: true`) — structured JSON logs
- Migrations: `drizzle-kit generate` + `drizzle-kit migrate` (from architecture)

**PRD requirements being fulfilled:**
- FR30: Application runs via `docker-compose up` with all three containers
- FR32: Backend health check endpoint (created in Story 5.1) + Docker health checks
- FR34: Container logs accessible via `docker-compose logs`
- NFR15: Application fully functional via single `docker-compose up`
- NFR16: Containers report health status via `docker-compose ps`

### docker-compose.yml Structure

```yaml
version: '3.8'

services:
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: ${POSTGRES_DB:-todo}
      POSTGRES_USER: ${POSTGRES_USER:-todo_user}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-todo_pass}
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER:-todo_user} -d ${POSTGRES_DB:-todo}"]
      interval: 5s
      timeout: 5s
      retries: 5
    restart: unless-stopped

  backend:
    build:
      context: .
      dockerfile: backend/Dockerfile
    environment:
      DATABASE_URL: postgresql://${POSTGRES_USER:-todo_user}:${POSTGRES_PASSWORD:-todo_pass}@db:5432/${POSTGRES_DB:-todo}
      PORT: 3000
    depends_on:
      db:
        condition: service_healthy
    healthcheck:
      test: ["CMD-SHELL", "wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1"]
      interval: 10s
      timeout: 5s
      retries: 3
      start_period: 15s
    restart: unless-stopped

  frontend:
    build:
      context: .
      dockerfile: frontend/Dockerfile
    ports:
      - "${FRONTEND_PORT:-5173}:80"
    depends_on:
      backend:
        condition: service_healthy
    restart: unless-stopped

volumes:
  pgdata:
```

**Key design decisions:**
- `version: '3.8'` for health check `condition: service_healthy` support
- Default values via `${VAR:-default}` syntax — works without `.env` file for quick start
- Port 5173 for frontend — matches Vite dev port for consistent developer experience
- No port exposed for `db` or `backend` — only frontend is externally accessible
- `start_period: 15s` for backend — allows time for migration + Fastify startup
- `restart: unless-stopped` — survives Docker daemon restarts but allows manual stop

### Database Migration Strategy

**Critical decision: Migrations must run automatically on `docker-compose up`.**

**Preferred approach — entrypoint script:**

Create `backend/docker-entrypoint.sh`:
```bash
#!/bin/sh
set -e

# Run database migrations
echo "Running database migrations..."
npx drizzle-kit migrate

# Start the application
echo "Starting backend server..."
exec node backend/dist/server.js
```

**Dockerfile changes needed (update from Story 5.1):**
```dockerfile
# In production stage, additionally copy:
COPY --from=build /app/backend/drizzle backend/drizzle
COPY --from=build /app/backend/drizzle.config.ts backend/
COPY backend/docker-entrypoint.sh backend/
RUN chmod +x backend/docker-entrypoint.sh

CMD ["./backend/docker-entrypoint.sh"]
```

**Key considerations:**
- `drizzle-kit` must be available in the production image — it's currently a devDependency. Either move it to dependencies, or install it separately in the production stage
- Migration files are in `backend/drizzle/*.sql` — must be copied into the image
- `drizzle.config.ts` references `DATABASE_URL` from environment — this works because the env var is set in docker-compose
- Migrations are idempotent — safe to re-run on an existing database (Drizzle tracks applied migrations)
- `set -e` ensures the container fails if migration fails (don't start with bad schema)

### Networking

Docker Compose automatically creates a default bridge network for the project. All services can reach each other by service name:
- `frontend` → `backend:3000` (nginx proxy_pass from Story 5.1)
- `backend` → `db:5432` (DATABASE_URL)

**No custom network definition needed** — the default network is sufficient for this project.

**Port exposure:**
- Only `frontend` exposes a port to the host (`5173:80`)
- `backend` and `db` are internal-only — accessible only within the Docker network
- This is more secure — database is not directly accessible from the host

### PostgreSQL Configuration

**Image:** `postgres:16-alpine` — matches Drizzle ORM compatibility, Alpine for minimal size.

**Volume:** Named volume `pgdata` mounted to `/var/lib/postgresql/data`:
- Data persists across `docker-compose down` and `docker-compose up`
- Only destroyed with `docker-compose down -v` (explicit volume removal)
- Docker manages the volume location — no host path binding needed

**Health check:** `pg_isready` is included in the PostgreSQL image — no additional tooling needed.

**Initialization:** PostgreSQL auto-creates the database from `POSTGRES_DB` on first run. No init scripts needed — Drizzle migrations handle schema creation.

### Health Check Details

**PostgreSQL:**
- Command: `pg_isready -U todo_user -d todo`
- Interval: 5s (check frequently during startup)
- Retries: 5 (allow 25s total startup time)
- Ready when: PostgreSQL accepts connections

**Backend:**
- Command: `wget --spider http://localhost:3000/api/health` (wget is available in Alpine, curl is not)
- Interval: 10s
- Start period: 15s (grace window for migrations + server boot)
- Retries: 3
- Ready when: `/api/health` returns 200

**Frontend (nginx):**
- No health check configured — nginx starts nearly instantly and serves static files
- Depends on backend being healthy — by the time frontend starts, the full stack is ready

### .env.example Updates

```bash
# ============================================
# Docker Compose Environment Variables
# ============================================
# Copy this file to .env and modify as needed
# Default values work out of the box for local Docker development

# PostgreSQL
POSTGRES_DB=todo
POSTGRES_USER=todo_user
POSTGRES_PASSWORD=todo_pass

# Backend (auto-constructed from above in docker-compose.yml)
# DATABASE_URL=postgresql://todo_user:todo_pass@db:5432/todo
# PORT=3000

# Frontend
# FRONTEND_PORT=5173
```

**Note:** The root `.env.example` is for Docker Compose. The existing `backend/.env.example` remains for local (non-Docker) development.

### What NOT To Do

- Do NOT expose database port to host — keep `db` internal-only for security
- Do NOT expose backend port to host — all API access goes through nginx proxy
- Do NOT use `docker-compose run` for migrations — they should be automatic on startup
- Do NOT hardcode credentials in `docker-compose.yml` — use `${VAR:-default}` pattern
- Do NOT use `volumes:` with host bind mounts for database — use named volumes only
- Do NOT add `docker-compose.override.yml` — that's Story 5.3 (profiles)
- Do NOT add compose profiles — that's Story 5.3
- Do NOT use `depends_on` without `condition: service_healthy` — startup order alone is insufficient
- Do NOT use `curl` in Alpine health checks — Alpine doesn't include curl; use `wget`
- Do NOT add a custom Docker network definition — the default network is sufficient
- Do NOT set `shm_size` for PostgreSQL — only needed for large databases with high shared_buffers
- Do NOT add resource limits (deploy.resources) — that's a production concern, not needed for local dev

### Previous Story Intelligence

**From Story 5.1 (Dockerfiles for Frontend & Backend) — PREREQUISITE:**
This story depends entirely on Story 5.1 being complete. Story 5.1 creates:
- `backend/Dockerfile` — multi-stage build, non-root user, port 3000
- `frontend/Dockerfile` — multi-stage build, nginx, non-root user, port 80
- `frontend/nginx.conf` — SPA fallback + API proxy to `http://backend:3000`
- `.dockerignore` — excludes node_modules, .env, dist, etc.
- `GET /api/health` endpoint returning `{ success: true, data: { status: "ok" } }`
- `backend/package.json` `build` script (`tsc`)

**Changes needed to Story 5.1 artifacts:**
- Backend Dockerfile needs migration file copies added (Task 7)
- Backend Dockerfile needs entrypoint script support (Task 5)
- These are additive changes — Story 5.1's core structure remains intact

**From Story 4.2 (last MVP story):**
- 101 tests pass (67 frontend + 34 backend) — no test changes in this story
- Backend `app.ts` registers routes — health route added in Story 5.1

**From architecture.md:**
- Drizzle migrations via `drizzle-kit generate` + `drizzle-kit migrate`
- Migration SQL files stored in `backend/drizzle/`
- `drizzle.config.ts` reads `DATABASE_URL` from environment
- Fastify logger enabled (`logger: true`) — Pino JSON logs visible in compose logs

### Current Project Structure After Story 5.1 (expected)

```
todo/
├── docker-compose.yml          ← NEW (this story)
├── .dockerignore               ← from Story 5.1
├── .env.example                ← UPDATED (Docker vars, this story)
├── package.json
├── pnpm-workspace.yaml
├── backend/
│   ├── Dockerfile              ← from Story 5.1, UPDATED (migration copy)
│   ├── docker-entrypoint.sh    ← NEW (this story)
│   ├── .env.example            ← existing (local dev)
│   ├── drizzle.config.ts
│   ├── drizzle/                ← migration SQL files (must be in image)
│   │   └── *.sql
│   └── src/
│       ├── server.ts
│       ├── app.ts
│       ├── health.routes.ts    ← from Story 5.1
│       └── ...
├── frontend/
│   ├── Dockerfile              ← from Story 5.1
│   ├── nginx.conf              ← from Story 5.1
│   └── src/
└── shared/
```

### Project Structure Notes

- New files: `docker-compose.yml` (root), `backend/docker-entrypoint.sh`, root `.env.example` (updated)
- Modified: `backend/Dockerfile` (add migration file copies + entrypoint)
- Modified: `README.md` (Docker usage section)
- No source code changes — this is purely infrastructure/configuration

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 5.2 — Docker Compose Orchestration]
- [Source: _bmad-output/planning-artifacts/prd.md#Containerisation (Post-MVP — Step 3) — FR30, FR32, FR34]
- [Source: _bmad-output/planning-artifacts/prd.md#Non-Functional Requirements — NFR15, NFR16]
- [Source: _bmad-output/planning-artifacts/architecture.md#Infrastructure & Deployment]
- [Source: _bmad-output/planning-artifacts/architecture.md#Data Architecture — migrations via drizzle-kit]
- [Source: _bmad-output/planning-artifacts/architecture.md#Development Workflow — migration commands]
- [Source: _bmad-output/implementation-artifacts/5-1-dockerfiles-for-frontend-and-backend.md — prerequisite story]
- [Source: backend/drizzle.config.ts — migration config, reads DATABASE_URL]
- [Source: backend/src/server.ts — entry point, listens 0.0.0.0:3000]
- [Source: frontend/nginx.conf — proxy_pass http://backend:3000 (from Story 5.1)]
- [Source: project-context.md — training Step 3 containerisation requirements]
- [Source: docs.docker.com/compose — Docker Compose reference]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

- Docker daemon not running on development machine — `docker-compose up` could not be verified at runtime. All configuration files follow exact patterns from Dev Notes.
- `drizzle-kit` is a devDependency so cannot be installed via `--prod`. Resolved by installing it separately in production stage with `pnpm add -w drizzle-kit`.

### Completion Notes List

- Created `docker-compose.yml` with three services: db (postgres:16-alpine), backend (Fastify), frontend (nginx)
- PostgreSQL configured with named volume `pgdata`, health check via `pg_isready`, `${VAR:-default}` pattern for credentials
- Backend configured with `DATABASE_URL` pointing to `db` service, health check via `wget` on `/api/health`, `depends_on: db: condition: service_healthy`
- Frontend configured with port mapping `5173:80`, `depends_on: backend: condition: service_healthy`
- Created `backend/docker-entrypoint.sh` that runs `npx drizzle-kit migrate` then starts the server with `exec node`
- Updated backend Dockerfile: copies migration files, drizzle config, entrypoint script; installs drizzle-kit in production stage
- Created root `.env.example` with Docker Compose variables and documentation
- Updated README.md with "Running with Docker" section and health endpoint in API table
- All 107 tests pass (36 backend + 71 frontend), zero regressions — no source code changes in this story

### Change Log

- 2026-03-12: Implemented Story 5.2 — Docker Compose orchestration with 3 services, automatic migrations, health checks, volume persistence

### File List

- `docker-compose.yml` (new) — three-service orchestration with health checks and named volume
- `.env.example` (new) — Docker Compose environment variable documentation
- `backend/Dockerfile` (modified) — added migration files, drizzle config, entrypoint script, drizzle-kit install
- `backend/docker-entrypoint.sh` (new) — runs migrations then starts server
- `README.md` (modified) — added "Running with Docker" section, health endpoint in API table
