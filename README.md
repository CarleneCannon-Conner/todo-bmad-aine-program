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

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://localhost:5432/todo_dev` |
| `PORT` | Backend server port | `3000` |
