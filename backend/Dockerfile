# Stage 1: Install dependencies
FROM node:22-alpine AS deps
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@10.32.1 --activate
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY backend/package.json backend/
COPY shared/package.json shared/
RUN pnpm install --frozen-lockfile

# Stage 2: Build TypeScript
FROM deps AS build
COPY shared/ shared/
COPY backend/ backend/
RUN pnpm --filter @todo/shared build && pnpm --filter backend build

# Stage 3: Production
FROM node:22-alpine AS production
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@10.32.1 --activate
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY backend/package.json backend/
COPY shared/package.json shared/
RUN pnpm install --frozen-lockfile
ENV NODE_ENV=production
COPY --from=build /app/backend/dist backend/dist
COPY --from=build /app/shared/dist shared/dist
COPY --from=build /app/shared/package.json shared/
COPY --from=build /app/backend/drizzle backend/drizzle
COPY --from=build /app/backend/drizzle.config.ts backend/
COPY backend/docker-entrypoint.sh backend/
RUN chmod +x backend/docker-entrypoint.sh
USER node
EXPOSE 3000
CMD ["./backend/docker-entrypoint.sh"]
