import { pool } from '../db/pool.js';

export function isAdmin(user) {
  return user?.role === 'admin';
}

export function isEditor(user) {
  return ['admin', 'editor'].includes(user?.role);
}

export function requireEditorRole(req, res, next) {
  if (!isEditor(req.auth?.user)) {
    return res.status(403).json({ error: 'Acesso restrito a administradores e editores.' });
  }
  next();
}

export function requireAdminRole(req, res, next) {
  if (!isAdmin(req.auth?.user)) {
    return res.status(403).json({ error: 'Acesso restrito ao administrador.' });
  }
  next();
}

export async function userCanAccessClient(user, clientId) {
  if (!clientId) return false;
  if (isAdmin(user)) return true;

  const result = await pool.query(
    'select 1 from user_clients where user_id = $1 and client_id = $2',
    [user.id, clientId]
  );
  return result.rows.length > 0;
}

export async function requireClientAccess(req, res, clientId) {
  const allowed = await userCanAccessClient(req.auth.user, clientId);
  if (!allowed) {
    res.status(403).json({ error: 'Você não tem acesso a este cliente.' });
    return false;
  }
  return true;
}

export async function getReportClientId(reportId) {
  const result = await pool.query('select client_id from reports where id = $1', [reportId]);
  return result.rows[0]?.client_id || null;
}

export async function getReportLinkClientId(linkId) {
  const result = await pool.query(
    `select r.client_id
     from report_links rl
     join reports r on r.id = rl.report_id
     where rl.id = $1`,
    [linkId]
  );
  return result.rows[0]?.client_id || null;
}
