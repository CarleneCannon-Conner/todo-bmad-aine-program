import { FastifyInstance } from 'fastify';
import { Type } from '@sinclair/typebox';
import { listTodos, createTodo, toggleTodo, deleteTodo, ValidationError, NotFoundError } from './todo.service.js';
import type { ApiResponse, Todo } from '@todo/shared';

const CreateTodoBody = Type.Object({
  text: Type.String({ minLength: 1 }),
});

const ToggleTodoBody = Type.Object({
  isCompleted: Type.Boolean(),
});

const TodoParams = Type.Object({
  id: Type.String({ format: 'uuid' }),
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
      const todo = await createTodo(fastify.db, request.body.text);
      const response: ApiResponse<Todo> = { success: true, data: todo };
      return reply.status(201).send(response);
    },
  );

  fastify.patch<{ Params: { id: string }; Body: { isCompleted: boolean } }>(
    '/:id',
    { schema: { params: TodoParams, body: ToggleTodoBody } },
    async (request, reply) => {
      const todo = await toggleTodo(fastify.db, request.params.id, request.body.isCompleted);
      const response: ApiResponse<Todo> = { success: true, data: todo };
      return reply.status(200).send(response);
    },
  );

  fastify.delete<{ Params: { id: string } }>(
    '/:id',
    { schema: { params: TodoParams } },
    async (request, reply) => {
      const result = await deleteTodo(fastify.db, request.params.id);
      const response: ApiResponse<{ id: string }> = { success: true, data: result };
      return reply.status(200).send(response);
    },
  );

  fastify.setErrorHandler(async (error, _request, reply) => {
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
    fastify.log.error(error);
    const response: ApiResponse<never> = {
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Internal server error' },
    };
    return reply.status(500).send(response);
  });
}
