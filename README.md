# Todo App

A full-stack todo application built with React, Fastify, and PostgreSQL.

## Prerequisites

- Node.js 18+
- pnpm
- PostgreSQL

## Getting Started

```bash
# Install dependencies
pnpm install

# Set up environment
cp backend/.env.example backend/.env
# Edit backend/.env with your DATABASE_URL if needed

# Create the database (if it doesn't exist)
createdb todo_dev

# Run database migrations
pnpm --filter backend migrate

# Start both frontend and backend
pnpm -r dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:3000

## Running with Docker

Requires [Docker](https://docs.docker.com/get-docker/) installed. Run **one mode at a time** — `docker-compose down` before switching.

### Production-like mode

Built images, nginx serving frontend, optimised for testing deployment.

```bash
docker compose --profile prod up            # start all services
docker compose --profile prod up --build    # rebuild after code changes
```

- App: http://localhost:5173
- Migrations run automatically on backend startup
- First build may take a few minutes; subsequent starts are fast

### Dev mode (hot reload)

Volume-mounted source code with live reload — no image rebuild needed.

```bash
docker compose --profile dev up
```

- Frontend: Vite dev server with HMR at http://localhost:5173
- Backend: `tsx watch` with auto-restart on file changes
- Edit source files locally — changes reflect immediately in containers

### Test mode (isolated database)

Separate PostgreSQL instance for test isolation.

```bash
docker compose --profile test up -d
```

- Uses `todo_test` database on a separate volume
- Backend-test runs on port 3001 (internal)

### Common commands

```bash
docker compose down          # stop all services
docker compose down -v       # stop and reset data
docker compose logs          # view logs
docker compose ps            # check service health
```

Optionally copy `.env.example` to `.env` to customise credentials or ports.

## Project Structure

```
todo/
├── frontend/    ← React + Vite SPA (:5173)
├── backend/     ← Fastify API (:3000)
├── shared/      ← @todo/shared types and Drizzle schema
├── e2e/         ← Playwright E2E tests
└── README.md
```

## API Endpoints

All endpoints return an `ApiResponse<T>` envelope:
- Success: `{ success: true, data: T }`
- Error: `{ success: false, error: { code: string, message: string } }`

| Method | Path | Description | Status Codes |
|--------|------|-------------|-------------|
| GET | `/api/health` | Health check | 200 |
| GET | `/api/todos` | List all todos (newest first) | 200 |
| POST | `/api/todos` | Create a new todo | 201, 400 |
| PATCH | `/api/todos/:id` | Toggle completion status (Epic 2) | 200, 404 |
| DELETE | `/api/todos/:id` | Delete a todo (Epic 2) | 200, 404 |

## Testing

```bash
# Unit and integration tests (Vitest)
pnpm -r test

# E2E tests (Playwright, requires running dev servers)
pnpm --filter e2e test
```

## Documentation

This project was built using the [BMAD Method](https://github.com/bmadcode/BMAD-METHOD) framework with AI assistance. See [Learning-BMAD-Notes.md](Learning-BMAD-Notes.md) for the AI integration log, development process notes, and lessons learned.

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://localhost:5432/todo_dev` |
| `PORT` | Backend server port | `3000` |
