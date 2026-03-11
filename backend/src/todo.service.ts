import { desc, eq } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { todos } from '@todo/shared';
import type { Todo } from '@todo/shared';

type DB = NodePgDatabase<typeof import('@todo/shared')>;

export async function listTodos(db: DB): Promise<Todo[]> {
  return db.select().from(todos).orderBy(desc(todos.createdAt));
}

export async function createTodo(db: DB, text: string): Promise<Todo> {
  const trimmed = text.trim();
  if (!trimmed) {
    throw new ValidationError('Text cannot be empty');
  }

  const [todo] = await db.insert(todos).values({ text: trimmed }).returning();
  return todo;
}

export async function toggleTodo(db: DB, id: string, isCompleted: boolean): Promise<Todo> {
  const [updated] = await db.update(todos).set({ isCompleted }).where(eq(todos.id, id)).returning();
  if (!updated) {
    throw new NotFoundError(`Todo with id ${id} not found`);
  }
  return updated;
}

export async function deleteTodo(db: DB, id: string): Promise<{ id: string }> {
  const [deleted] = await db.delete(todos).where(eq(todos.id, id)).returning();
  if (!deleted) {
    throw new NotFoundError(`Todo with id ${id} not found`);
  }
  return { id: deleted.id };
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}
