import { Router } from 'express';
import { pool } from '../db/pool.js';
import { requireAuth } from '../middleware/auth.js';
import { logAudit } from '../utils/audit.js';
import { getReportClientId, isAdmin, requireClientAccess, requireEditorRole, userCanAccessClient } from '../utils/permissions.js';
import { generateId } from '../utils/security.js';

const router = Router();

router.use(requireAuth);

router.get('/', async (req, res) => {
  const filters = [];
  const params = [];

  if (!isAdmin(req.auth.user)) {
    params.push(req.auth.user.id);
    filters.push(`exists (
      select 1 from user_clients uc
      where uc.client_id = r.client_id and uc.user_id = $${params.length}
    )`);
  }

  if (req.auth.user.role === 'viewer') {
    filters.push("r.status = 'published'");
  }

  if (req.query.clientId) {
    params.push(req.query.clientId);
    filters.push(`r.client_id = $${params.length}`);
  }
  if (req.query.periodType) {
    params.push(req.query.periodType);
    filters.push(`r.period_type = $${params.length}`);
  }
  if (req.query.status && req.auth.user.role !== 'viewer') {
    params.push(req.query.status);
    filters.push(`r.status = $${params.length}`);
  }
  if (req.query.search) {
    params.push(`%${String(req.query.search).toLowerCase()}%`);
    filters.push(`(lower(r.title) like $${params.length} or lower(coalesce(r.description, '')) like $${params.length})`);
  }

  const where = filters.length ? `where ${filters.join(' and ')}` : '';
  const result = await pool.query(
    `select r.*,
            c.name as client_name,
            c.logo_url as client_logo_url,
            count(rl.id)::int as links_count
     from reports r
     join clients c on c.id = r.client_id
     left join report_links rl on rl.report_id = r.id and rl.status = 'active'
     ${where}
     group by r.id, c.name, c.logo_url
     order by coalesce(r.starts_at, r.created_at::date) desc, r.created_at desc`,
    params
  );

  res.json(result.rows);
});

router.post('/', requireEditorRole, async (req, res) => {
  const payload = normalizeReportPayload(req.body);
  if (!payload.clientId || !payload.title || !payload.periodType) {
    return res.status(400).json({ error: 'Cliente, titulo e periodo sao obrigatorios.' });
  }

  if (!(await requireClientAccess(req, res, payload.clientId))) return;

  const id = generateId();
  await pool.query(
    `insert into reports (
       id, client_id, title, description, period_type, period_label, starts_at, ends_at,
       reference_year, reference_month, status, published_at, created_by
     ) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
    [
      id,
      payload.clientId,
      payload.title,
      payload.description,
      payload.periodType,
      payload.periodLabel,
      payload.startsAt,
      payload.endsAt,
      payload.referenceYear,
      payload.referenceMonth,
      payload.status,
      payload.status === 'published' ? new Date().toISOString() : null,
      req.auth.user.id
    ]
  );
  await logAudit({ req, action: 'report_created', entityType: 'report', entityId: id, metadata: payload });
  res.status(201).json({ id });
});

router.get('/:id', async (req, res) => {
  const result = await pool.query(
    `select r.*, c.name as client_name, c.logo_url as client_logo_url
     from reports r
     join clients c on c.id = r.client_id
     where r.id = $1`,
    [req.params.id]
  );
  const report = result.rows[0];
  if (!report) return res.status(404).json({ error: 'Relatorio nao encontrado.' });
  if (!(await canAccessClient(req, report.client_id, report.status))) {
    return res.status(403).json({ error: 'Voce nao tem acesso a este relatorio.' });
  }
  const links = await pool.query('select * from report_links where report_id = $1 order by sort_order, created_at', [req.params.id]);
  res.json({ ...report, links: links.rows });
});

router.patch('/:id', requireEditorRole, async (req, res) => {
  const payload = normalizeReportPayload(req.body);
  const currentClientId = await getReportClientId(req.params.id);
  if (!currentClientId) {
    return res.status(404).json({ error: 'Relatorio nao encontrado.' });
  }
  if (!(await requireClientAccess(req, res, currentClientId))) return;
  if (payload.clientId && !(await requireClientAccess(req, res, payload.clientId))) return;

  const result = await pool.query(
    `update reports
     set client_id = coalesce($2, client_id),
         title = coalesce($3, title),
         description = coalesce($4, description),
         period_type = coalesce($5, period_type),
         period_label = coalesce($6, period_label),
         starts_at = coalesce($7, starts_at),
         ends_at = coalesce($8, ends_at),
         reference_year = coalesce($9, reference_year),
         reference_month = coalesce($10, reference_month),
         status = coalesce($11, status),
         published_at = case when $11 = 'published' and published_at is null then now() else published_at end,
         updated_at = now()
     where id = $1
     returning id`,
    [
      req.params.id,
      payload.clientId,
      payload.title,
      payload.description,
      payload.periodType,
      payload.periodLabel,
      payload.startsAt,
      payload.endsAt,
      payload.referenceYear,
      payload.referenceMonth,
      payload.status
    ]
  );
  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Relatorio nao encontrado.' });
  }
  await logAudit({ req, action: 'report_updated', entityType: 'report', entityId: req.params.id, metadata: payload });
  res.json({ success: true });
});

router.delete('/:id', requireEditorRole, async (req, res) => {
  const currentClientId = await getReportClientId(req.params.id);
  if (!currentClientId) {
    return res.status(404).json({ error: 'Relatorio nao encontrado.' });
  }
  if (!(await requireClientAccess(req, res, currentClientId))) return;

  await pool.query("update reports set status = 'archived', updated_at = now() where id = $1", [req.params.id]);
  await logAudit({ req, action: 'report_archived', entityType: 'report', entityId: req.params.id });
  res.json({ success: true, archived: true });
});

function normalizeReportPayload(body) {
  return {
    clientId: body.clientId || body.client_id || null,
    title: body.title ? String(body.title).trim() : null,
    description: body.description === undefined ? null : String(body.description).trim(),
    periodType: body.periodType || body.period_type || null,
    periodLabel: body.periodLabel === undefined ? null : String(body.periodLabel).trim(),
    startsAt: body.startsAt || body.starts_at || null,
    endsAt: body.endsAt || body.ends_at || null,
    referenceYear: body.referenceYear || body.reference_year || null,
    referenceMonth: body.referenceMonth || body.reference_month || null,
    status: body.status || null
  };
}

async function canAccessClient(req, clientId, reportStatus) {
  if (isAdmin(req.auth.user)) return true;
  if (req.auth.user.role === 'viewer' && reportStatus !== 'published') return false;
  return userCanAccessClient(req.auth.user, clientId);
}

export default router;
