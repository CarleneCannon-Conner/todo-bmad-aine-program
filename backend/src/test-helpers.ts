import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '@todo/shared';

const __dirname = dirname(fileURLToPath(import.meta.url));

let pool: pg.Pool;
let db: NodePgDatabase<typeof schema>;

export function getTestPool(): pg.Pool {
  if (!pool) {
    pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
  }
  return pool;
}

export function getTestDb(): NodePgDatabase<typeof schema> {
  if (!db) {
    db = drizzle(getTestPool(), { schema });
  }
  return db;
}

export async function setupTestDb(): Promise<void> {
  const p = getTestPool();
  // Run the actual Drizzle migration SQL to keep test schema in sync
  const migrationPath = resolve(__dirname, '../drizzle/0000_overjoyed_venom.sql');
  const migrationSql = readFileSync(migrationPath, 'utf-8');
  // Wrap in IF NOT EXISTS for idempotency
  await p.query(migrationSql.replace('CREATE TABLE', 'CREATE TABLE IF NOT EXISTS'));
}

export async function truncateTodos(): Promise<void> {
  await getTestPool().query('TRUNCATE TABLE todos');
}

export async function teardownTestDb(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = undefined!;
    db = undefined!;
  }
}
