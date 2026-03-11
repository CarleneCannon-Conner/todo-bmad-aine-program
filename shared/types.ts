import type { InferSelectModel } from 'drizzle-orm';
import type { todos } from './schema.js';

export type Todo = InferSelectModel<typeof todos>;

export interface CreateTodoRequest {
  text: string;
}

export type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: { code: string; message: string } };
