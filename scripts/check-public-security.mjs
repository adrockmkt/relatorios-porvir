import assert from 'node:assert/strict';
import fs from 'node:fs';

const healthRoute = fs.readFileSync('server/src/routes/health.js', 'utf8');
const uploadsRoute = fs.readFileSync('server/src/routes/uploads.js', 'utf8');
const appSource = fs.readFileSync('src/App.tsx', 'utf8');
const nginxConfig = fs.readFileSync('deploy/nginx/relatorios.porvir.org', 'utf8');

assert.doesNotMatch(healthRoute, /backup|database|details|getLatestBackup/, 'Public health endpoint must not expose database, backup, or error details.');
assert.match(healthRoute, /status:\s*'ok'/, 'Public health endpoint must keep a minimal OK response for uptime checks.');

assert.doesNotMatch(uploadsRoute, /svg/i, 'Image upload API must not accept SVG files.');
assert.doesNotMatch(appSource, /image\/svg\+xml|SVG/, 'Image upload UI must not advertise SVG uploads.');
assert.match(nginxConfig, /location\s+~\*\s+\^\/uploads\/\.\*\\\.svg\$/, 'Nginx must block direct access to SVG files in uploads.');
assert.match(nginxConfig, /location\s+=\s+\/index\.html[\s\S]*no-cache, no-store, must-revalidate/, 'Nginx must prevent stale index.html caching after deployments.');
assert.match(nginxConfig, /location\s+\/assets\/[\s\S]*immutable/, 'Nginx must cache versioned assets as immutable files.');
