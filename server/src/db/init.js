import { runMigrations } from './migrate.js';

export async function ensureSchema() {
  await runMigrations();
}
