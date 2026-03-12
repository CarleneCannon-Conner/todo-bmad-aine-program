#!/bin/sh
set -e

# Run database migrations
echo "Running database migrations..."
pnpm exec drizzle-kit migrate

# Start the application
echo "Starting backend server..."
exec node backend/dist/server.js
