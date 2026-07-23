import { Router } from 'express';
import { pool } from '../db/pool.js';
import { requireAuth } from '../middleware/auth.js';
import { logAudit } from '../utils/audit.js';
import { generateId } from '../utils/security.js';

const router = Router();

router.use(requireAuth);

router.get('/', async (req, res) => {
  const query = req.auth.user.role === 'viewer'
    ? `select c.*,
              count(distinct r.id)::int as reports_count,
              max(r.published_at) as last_published_at
       from clients c
       join user_clients uc on uc.client_id = c.id
       left join reports r on r.client_id = c.id and r.status = 'published'
       where uc.user_id = $1 and c.status <> 'archived'
       group by c.id
       order by c.name`
    : `select c.*,
              count(distinct r.id)::int as reports_count,
              max(r.published_at) as last_published_at
       from clients c
       left join reports r on r.client_id = c.id
       group by c.id
       order by c.name`;
  const params = req.auth.user.role === 'viewer' ? [req.auth.user.id] : [];
  const result = await pool.query(query, params);
  res.json(result.rows);
});

router.post('/', requireEditor, async (req, res) => {
  const { name, logoUrl = '', description = '', status = 'active' } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Nome do cliente e obrigatorio.' });
  }

  const id = generateId();
  const slug = await uniqueSlug(name);
  await pool.query(
    `insert into clients (id, name, slug, logo_url, description, status, created_by)
     values ($1, $2, $3, $4, $5, $6, $7)`,
    [id, name.trim(), slug, logoUrl.trim() || null, description.trim() || null, status, req.auth.user.id]
  );
  await logAudit({
    req,
    action: 'client_created',
    entityType: 'client',
    entityId: id,
    metadata: { name: name.trim(), status }
  });
  res.status(201).json({ id });
});

router.patch('/:id', requireEditor, async (req, res) => {
  const { id } = req.params;
  const { name, logoUrl, description, status } = req.body;
  await pool.query(
    `update clients
     set name = coalesce($2, name),
         logo_url = coalesce($3, logo_url),
         description = coalesce($4, description),
         status = coalesce($5, status),
         updated_at = now()
     where id = $1`,
    [
      id,
      name === undefined ? null : String(name).trim(),
      logoUrl === undefined ? null : String(logoUrl).trim(),
      description === undefined ? null : String(description).trim(),
      status || null
    ]
  );
  await logAudit({
    req,
    action: 'client_updated',
    entityType: 'client',
    entityId: id,
    metadata: { name, logoUrl, description, status }
  });
  res.json({ success: true });
});

router.delete('/:id', requireEditor, async (req, res) => {
  const { id } = req.params;
  const reportCount = await pool.query('select count(*)::int as total from reports where client_id = $1', [id]);
  if (reportCount.rows[0].total > 0) {
    await pool.query('update clients set status = $2, updated_at = now() where id = $1', [id, 'archived']);
    await logAudit({ req, action: 'client_archived', entityType: 'client', entityId: id });
    return res.json({ success: true, archived: true });
  }

  await pool.query('delete from clients where id = $1', [id]);
  await logAudit({ req, action: 'client_deleted', entityType: 'client', entityId: id });
  res.json({ success: true });
});

router.get('/:id/users', requireEditor, async (req, res) => {
  const result = await pool.query(
    `select u.id, u.name, u.email, u.role, u.status, uc.created_at
     from user_clients uc
     join users u on u.id = uc.user_id
     where uc.client_id = $1
     order by u.name`,
    [req.params.id]
  );
  res.json(result.rows);
});

router.put('/:id/users', requireEditor, async (req, res) => {
  const userIds = Array.isArray(req.body.userIds) ? req.body.userIds : [];
  const clientId = req.params.id;

  await pool.query('delete from user_clients where client_id = $1', [clientId]);
  for (const userId of userIds) {
    await pool.query(
      `insert into user_clients (user_id, client_id, created_by)
       values ($1, $2, $3)
       on conflict (user_id, client_id) do nothing`,
      [userId, clientId, req.auth.user.id]
    );
  }

  await logAudit({
    req,
    action: 'client_users_updated',
    entityType: 'client',
    entityId: clientId,
    metadata: { userIds }
  });
  res.json({ success: true });
});

function requireEditor(req, res, next) {
  if (!['admin', 'editor'].includes(req.auth.user.role)) {
    return res.status(403).json({ error: 'Acesso restrito a administradores e editores.' });
  }
  next();
}

async function uniqueSlug(name) {
  const baseSlug = slugify(name);
  let slug = baseSlug;
  let suffix = 2;
  while (true) {
    const existing = await pool.query('select id from clients where slug = $1', [slug]);
    if (existing.rows.length === 0) return slug;
    slug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }
}

function slugify(value) {
  return String(value || 'cliente')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'cliente';
}

export default router;
