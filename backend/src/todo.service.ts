import { desc } from 'drizzle-orm';
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

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}
