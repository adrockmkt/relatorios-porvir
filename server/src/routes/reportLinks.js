import { Router } from 'express';
import { pool } from '../db/pool.js';
import { requireAuth } from '../middleware/auth.js';
import { logAudit } from '../utils/audit.js';
import { generateId } from '../utils/security.js';

const router = Router();

router.use(requireAuth);

router.post('/', requireEditor, async (req, res) => {
  const payload = normalizeLinkPayload(req.body);
  if (!payload.reportId || !payload.title || !payload.url) {
    return res.status(400).json({ error: 'Relatorio, titulo e URL sao obrigatorios.' });
  }
  if (!isValidUrl(payload.url)) {
    return res.status(400).json({ error: 'Informe uma URL https valida.' });
  }

  const id = generateId();
  await pool.query(
    `insert into report_links (id, report_id, title, url, destination_type, description, sort_order, status, created_by)
     values ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
    [id, payload.reportId, payload.title, payload.url, payload.destinationType, payload.description, payload.sortOrder, payload.status, req.auth.user.id]
  );
  await logAudit({ req, action: 'report_link_created', entityType: 'report_link', entityId: id, metadata: payload });
  res.status(201).json({ id });
});

router.patch('/:id', requireEditor, async (req, res) => {
  const payload = normalizeLinkPayload(req.body);
  if (payload.url && !isValidUrl(payload.url)) {
    return res.status(400).json({ error: 'Informe uma URL https valida.' });
  }

  await pool.query(
    `update report_links
     set title = coalesce($2, title),
         url = coalesce($3, url),
         destination_type = coalesce($4, destination_type),
         description = coalesce($5, description),
         sort_order = coalesce($6, sort_order),
         status = coalesce($7, status),
         updated_at = now()
     where id = $1`,
    [req.params.id, payload.title, payload.url, payload.destinationType, payload.description, payload.sortOrder, payload.status]
  );
  await logAudit({ req, action: 'report_link_updated', entityType: 'report_link', entityId: req.params.id, metadata: payload });
  res.json({ success: true });
});

router.delete('/:id', requireEditor, async (req, res) => {
  await pool.query('delete from report_links where id = $1', [req.params.id]);
  await logAudit({ req, action: 'report_link_deleted', entityType: 'report_link', entityId: req.params.id });
  res.json({ success: true });
});

function requireEditor(req, res, next) {
  if (!['admin', 'editor'].includes(req.auth.user.role)) {
    return res.status(403).json({ error: 'Acesso restrito a administradores e editores.' });
  }
  next();
}

function normalizeLinkPayload(body) {
  return {
    reportId: body.reportId || body.report_id || null,
    title: body.title ? String(body.title).trim() : null,
    url: body.url ? String(body.url).trim() : null,
    destinationType: body.destinationType || body.destination_type || 'other',
    description: body.description === undefined ? null : String(body.description).trim(),
    sortOrder: body.sortOrder === undefined ? null : Number(body.sortOrder) || 0,
    status: body.status || null
  };
}

function isValidUrl(url) {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

export default router;
