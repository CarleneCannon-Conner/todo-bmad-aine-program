import { pgTable, uuid, text, boolean, timestamp } from 'drizzle-orm/pg-core';

export const todos = pgTable('todos', {
  id: uuid('id').primaryKey().defaultRandom(),
  text: text('text').notNull(),
  isCompleted: boolean('is_completed').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
