import Fastify from 'fastify';
import type { ApiResponse } from '@todo/shared';
import { ValidationError, NotFoundError } from './todo.service.js';
import dbPlugin from './db.js';
import todoRoutes from './todo.routes.js';

export async function buildApp(opts: { logger?: boolean } = {}) {
  const app = Fastify({ logger: opts.logger ?? true });

  // Global 404 for unknown routes
  app.setNotFoundHandler(async (_request, reply) => {
    const response: ApiResponse<never> = {
      success: false,
      error: { code: 'NOT_FOUND', message: 'Route not found' },
    };
    return reply.status(404).send(response);
  });

  // Global error handler — catches all unhandled errors
  app.setErrorHandler(async (error, request, reply) => {
    if (error.validation) {
      const response: ApiResponse<never> = {
        success: false,
        error: { code: 'VALIDATION_ERROR', message: error.message },
      };
      return reply.status(400).send(response);
    }
    if (error instanceof ValidationError) {
      const response: ApiResponse<never> = {
        success: false,
        error: { code: 'VALIDATION_ERROR', message: error.message },
      };
      return reply.status(400).send(response);
    }
    if (error instanceof NotFoundError) {
      const response: ApiResponse<never> = {
        success: false,
        error: { code: 'NOT_FOUND', message: error.message },
      };
      return reply.status(404).send(response);
    }
    request.log.error(error);
    const response: ApiResponse<never> = {
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Internal server error' },
    };
    return reply.status(500).send(response);
  });

  await app.register(dbPlugin);
  await app.register(todoRoutes, { prefix: '/api/todos' });

  return app;
}
