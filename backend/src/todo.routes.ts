import { FastifyInstance } from 'fastify';
import { Type } from '@sinclair/typebox';
import { listTodos, createTodo, toggleTodo, deleteTodo } from './todo.service.js';
import type { ApiResponse, Todo } from '@todo/shared';

const CreateTodoBody = Type.Object({
  text: Type.String({ minLength: 1, maxLength: 500 }),
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
}
