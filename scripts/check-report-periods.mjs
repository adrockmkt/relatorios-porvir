import assert from 'node:assert/strict';
import fs from 'node:fs';

const appSource = fs.readFileSync('src/App.tsx', 'utf8');
const typesSource = fs.readFileSync('src/types.ts', 'utf8');
const reportsRouteSource = fs.readFileSync('server/src/routes/reports.js', 'utf8');
const schemaSource = fs.readFileSync('server/src/db/schema.sql', 'utf8');
const migrations = fs
  .readdirSync('server/src/db/migrations')
  .filter((file) => file.endsWith('.sql'))
  .map((file) => fs.readFileSync(`server/src/db/migrations/${file}`, 'utf8'))
  .join('\n');

assert.match(typesSource, /'biweekly'/, 'ReportPeriodType must include biweekly.');
assert.match(appSource, /biweekly:\s*'Quinzenal'/, 'Report period labels must include Quinzenal.');
assert.match(reportsRouteSource, /'biweekly'/, 'Report API validation must accept biweekly.');
assert.match(schemaSource, /'biweekly'/, 'Database schema snapshot must include biweekly.');
assert.match(migrations, /'biweekly'/, 'Database migrations must allow biweekly reports.');
