import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool } from './pool.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const migrationsDir = path.join(__dirname, 'migrations');

export async function runMigrations() {
  await pool.query(`
    create table if not exists schema_migrations (
      id text primary key,
      applied_at timestamptz not null default now()
    )
  `);

  const files = (await fs.readdir(migrationsDir))
    .filter((file) => /^\d+_.+\.sql$/.test(file))
    .sort();

  for (const file of files) {
    const existing = await pool.query('select id from schema_migrations where id = $1', [file]);
    if (existing.rows.length > 0) continue;

    const sql = await fs.readFile(path.join(migrationsDir, file), 'utf8');
    await pool.query('begin');
    try {
      await pool.query(sql);
      await pool.query('insert into schema_migrations (id) values ($1)', [file]);
      await pool.query('commit');
      console.log(`Applied migration ${file}`);
    } catch (error) {
      await pool.query('rollback');
      throw error;
    }
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === __filename) {
  runMigrations()
    .then(async () => {
      await pool.end();
    })
    .catch(async (error) => {
      console.error('Failed to run migrations', error);
      await pool.end();
      process.exit(1);
    });
}
