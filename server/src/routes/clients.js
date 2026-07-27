import { Router } from 'express';
import { pool } from '../db/pool.js';
import { requireAuth } from '../middleware/auth.js';
import { logAudit } from '../utils/audit.js';
import { isAdmin, requireAdminRole, requireClientAccess, requireEditorRole } from '../utils/permissions.js';
import { generateId } from '../utils/security.js';

const router = Router();

router.use(requireAuth);

router.get('/', async (req, res) => {
  const scopedUser = !isAdmin(req.auth.user);
  const publishedOnly = req.auth.user.role === 'viewer';
  const query = scopedUser
    ? `select c.*,
              count(distinct r.id)::int as reports_count,
              max(r.published_at) as last_published_at
       from clients c
       join user_clients uc on uc.client_id = c.id
       left join reports r on r.client_id = c.id ${publishedOnly ? "and r.status = 'published'" : ''}
       where uc.user_id = $1 ${publishedOnly ? "and c.status <> 'archived'" : ''}
       group by c.id
       order by c.name`
    : `select c.*,
              count(distinct r.id)::int as reports_count,
              max(r.published_at) as last_published_at
       from clients c
       left join reports r on r.client_id = c.id
       group by c.id
       order by c.name`;
  const params = scopedUser ? [req.auth.user.id] : [];
  const result = await pool.query(query, params);
  res.json(result.rows);
});

router.post('/', requireEditorRole, async (req, res) => {
  const { name, logoUrl = '', description = '', status = 'active' } = req.body;
  const normalizedName = String(name || '').trim();
  const normalizedLogoUrl = String(logoUrl || '').trim();
  const normalizedDescription = String(description || '').trim();

  if (!normalizedName) {
    return res.status(400).json({ error: 'Nome do cliente e obrigatorio.' });
  }

  if (!isValidClientStatus(status)) {
    return res.status(400).json({ error: 'Status de cliente invalido.' });
  }

  if (normalizedLogoUrl && !isValidLogoUrl(normalizedLogoUrl)) {
    return res.status(400).json({ error: 'Informe uma URL de logo valida.' });
  }

  const id = generateId();
  const slug = await uniqueSlug(normalizedName);
  await pool.query(
    `insert into clients (id, name, slug, logo_url, description, status, created_by)
     values ($1, $2, $3, $4, $5, $6, $7)`,
    [id, normalizedName, slug, normalizedLogoUrl || null, normalizedDescription || null, status, req.auth.user.id]
  );
  if (!isAdmin(req.auth.user)) {
    await pool.query(
      `insert into user_clients (user_id, client_id, created_by)
       values ($1, $2, $3)
       on conflict (user_id, client_id) do nothing`,
      [req.auth.user.id, id, req.auth.user.id]
    );
  }
  await logAudit({
    req,
    action: 'client_created',
    entityType: 'client',
    entityId: id,
    metadata: { name: normalizedName, status }
  });
  res.status(201).json({ id });
});

router.patch('/:id', requireEditorRole, async (req, res) => {
  const { id } = req.params;
  if (!(await requireClientAccess(req, res, id))) return;

  const { name, logoUrl, description, status } = req.body;
  const normalizedName = name === undefined ? null : String(name).trim();
  const normalizedLogoUrl = logoUrl === undefined ? null : String(logoUrl).trim();
  const normalizedDescription = description === undefined ? null : String(description).trim();

  if (normalizedName !== null && !normalizedName) {
    return res.status(400).json({ error: 'Nome do cliente e obrigatorio.' });
  }

  if (status !== undefined && !isValidClientStatus(status)) {
    return res.status(400).json({ error: 'Status de cliente invalido.' });
  }

  if (normalizedLogoUrl && !isValidLogoUrl(normalizedLogoUrl)) {
    return res.status(400).json({ error: 'Informe uma URL de logo valida.' });
  }

  const result = await pool.query(
    `update clients
     set name = coalesce($2, name),
         logo_url = coalesce($3, logo_url),
         description = coalesce($4, description),
         status = coalesce($5, status),
         updated_at = now()
     where id = $1
     returning id`,
    [
      id,
      normalizedName,
      normalizedLogoUrl,
      normalizedDescription,
      status || null
    ]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Cliente nao encontrado.' });
  }

  await logAudit({
    req,
    action: 'client_updated',
    entityType: 'client',
    entityId: id,
    metadata: { name: normalizedName, logoUrl: normalizedLogoUrl, description: normalizedDescription, status }
  });
  res.json({ success: true });
});

router.delete('/:id', requireEditorRole, async (req, res) => {
  const { id } = req.params;
  if (!(await requireClientAccess(req, res, id))) return;

  const reportCount = await pool.query('select count(*)::int as total from reports where client_id = $1', [id]);
  if (reportCount.rows[0].total > 0) {
    const result = await pool.query('update clients set status = $2, updated_at = now() where id = $1 returning id', [id, 'archived']);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Cliente nao encontrado.' });
    }
    await logAudit({ req, action: 'client_archived', entityType: 'client', entityId: id });
    return res.json({ success: true, archived: true });
  }

  const result = await pool.query('delete from clients where id = $1 returning id', [id]);
  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Cliente nao encontrado.' });
  }
  await logAudit({ req, action: 'client_deleted', entityType: 'client', entityId: id });
  res.json({ success: true });
});

router.get('/:id/users', requireAdminRole, async (req, res) => {
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

router.put('/:id/users', requireAdminRole, async (req, res) => {
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

function isValidClientStatus(status) {
  return ['active', 'inactive', 'archived'].includes(status);
}

function isValidLogoUrl(value) {
  return /^https:\/\//i.test(value) || /^data:image\/(png|jpeg|webp|gif);base64,/i.test(value) || value.startsWith('/');
}

export default router;
