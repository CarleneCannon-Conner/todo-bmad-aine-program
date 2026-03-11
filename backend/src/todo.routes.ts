import { FastifyInstance } from 'fastify';
import { Type } from '@sinclair/typebox';
import { listTodos, createTodo, ValidationError } from './todo.service.js';
import type { ApiResponse, Todo } from '@todo/shared';

const CreateTodoBody = Type.Object({
  text: Type.String({ minLength: 1 }),
});

export default async function todoRoutes(fastify: FastifyInstance) {
  fastify.get('/', async (_request, reply) => {
    const todos = await listTodos(fastify.db);
    const response: ApiResponse<Todo[]> = { success: true, data: todos };
    return reply.status(200).send(response);
  });

  fastify.post<{ Body: { text: string } }>(
    '/',
    { schema: { body: CreateTodoBody } },
    async (request, reply) => {
      try {
        const todo = await createTodo(fastify.db, request.body.text);
        const response: ApiResponse<Todo> = { success: true, data: todo };
        return reply.status(201).send(response);
      } catch (error) {
        if (error instanceof ValidationError) {
          const response: ApiResponse<never> = {
            success: false,
            error: { code: 'VALIDATION_ERROR', message: error.message },
          };
          return reply.status(400).send(response);
        }
        throw error;
      }
    },
  );

  // Handle TypeBox validation errors
  fastify.setErrorHandler(async (error, _request, reply) => {
    if (error.validation) {
      const response: ApiResponse<never> = {
        success: false,
        error: { code: 'VALIDATION_ERROR', message: error.message },
      };
      return reply.status(400).send(response);
    }
    fastify.log.error(error);
    const response: ApiResponse<never> = {
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Internal server error' },
    };
    return reply.status(500).send(response);
  });
}
