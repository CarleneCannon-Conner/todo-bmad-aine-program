import Fastify from 'fastify';
import dbPlugin from './db.js';
import todoRoutes from './todo.routes.js';

export async function buildApp(opts: { logger?: boolean } = {}) {
  const app = Fastify({ logger: opts.logger ?? true });

  await app.register(dbPlugin);
  await app.register(todoRoutes, { prefix: '/api/todos' });

  return app;
}
