import { Router } from 'express';
import { pool } from '../db/pool.js';
import { requireAdmin, requireAuth } from '../middleware/auth.js';
import { logAudit } from '../utils/audit.js';
import { generateId, hashPassword, isStrongEnoughPassword, isValidEmail, normalizeEmail } from '../utils/security.js';

const router = Router();

router.use(requireAuth);

router.get('/', requireAdmin, async (_req, res) => {
  const result = await pool.query(
    'select id, name, email, role, status, created_at, updated_at from users order by created_at desc'
  );

  res.json(result.rows);
});

router.post('/', requireAdmin, async (req, res) => {
  const { name, email, password, role } = req.body;
  const normalizedName = String(name || '').trim();
  const normalizedEmail = normalizeEmail(email);

  if (!normalizedName || !normalizedEmail || !password || !role) {
    return res.status(400).json({ error: 'Nome, email, senha e perfil são obrigatórios.' });
  }

  if (!isValidEmail(normalizedEmail)) {
    return res.status(400).json({ error: 'Informe um email válido.' });
  }

  if (!isStrongEnoughPassword(password)) {
    return res.status(400).json({ error: 'A senha deve ter pelo menos 8 caracteres.' });
  }

  if (!['admin', 'editor', 'viewer'].includes(role)) {
    return res.status(400).json({ error: 'Perfil inválido.' });
  }

  const userId = generateId();
  await pool.query(
    'insert into users (id, name, email, password_hash, role, status) values ($1, $2, $3, $4, $5, $6)',
    [userId, normalizedName, normalizedEmail, hashPassword(password), role, 'active']
  );
  await logAudit({
    req,
    action: 'user_created',
    entityType: 'user',
    entityId: userId,
    metadata: { email: normalizedEmail, role }
  });

  res.status(201).json({ id: userId });
});

router.patch('/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { name, email, role, status } = req.body;
  const normalizedName = name === undefined ? null : String(name).trim();
  const normalizedEmail = email === undefined ? null : normalizeEmail(email);

  if (normalizedName !== null && !normalizedName) {
    return res.status(400).json({ error: 'Nome obrigatório.' });
  }

  if (email !== undefined && !normalizedEmail) {
    return res.status(400).json({ error: 'Email obrigatório.' });
  }

  if (normalizedEmail && !isValidEmail(normalizedEmail)) {
    return res.status(400).json({ error: 'Informe um email válido.' });
  }

  if (role !== undefined && !['admin', 'editor', 'viewer'].includes(role)) {
    return res.status(400).json({ error: 'Perfil inválido.' });
  }

  if (status !== undefined && !['active', 'inactive'].includes(status)) {
    return res.status(400).json({ error: 'Status inválido.' });
  }

  if (normalizedEmail) {
    const existing = await pool.query('select id from users where email = $1 and id <> $2', [normalizedEmail, id]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Já existe outro usuário com este email.' });
    }
  }

  await pool.query(
    `update users
     set name = coalesce($2, name),
         email = coalesce($3, email),
         role = coalesce($4, role),
         status = coalesce($5, status)
     where id = $1`,
    [id, normalizedName, normalizedEmail, role, status]
  );
  await logAudit({
    req,
    action: 'user_updated',
    entityType: 'user',
    entityId: id,
    metadata: { name: normalizedName, email: normalizedEmail, role, status }
  });

  res.json({ success: true });
});

router.delete('/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;
  if (id === req.auth.user.id) {
    return res.status(400).json({ error: 'Você não pode excluir o próprio usuário logado.' });
  }

  const result = await pool.query('delete from users where id = $1 returning id, email', [id]);
  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Usuário não encontrado.' });
  }

  await logAudit({
    req,
    action: 'user_deleted',
    entityType: 'user',
    entityId: id,
    metadata: { email: result.rows[0].email }
  });
  res.json({ success: true });
});

router.post('/:id/reset-password', requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { password } = req.body;

  if (!password || String(password).trim().length < 8) {
    return res.status(400).json({ error: 'A nova senha deve ter pelo menos 8 caracteres.' });
  }

  await pool.query('update users set password_hash = $2 where id = $1', [id, hashPassword(String(password).trim())]);
  await logAudit({
    req,
    action: 'user_password_reset',
    entityType: 'user',
    entityId: id
  });
  res.json({ success: true });
});

router.get('/:id/clients', requireAdmin, async (req, res) => {
  const result = await pool.query(
    `select c.id, c.name, c.slug, c.logo_url, c.description, c.status, uc.created_at
     from user_clients uc
     join clients c on c.id = uc.client_id
     where uc.user_id = $1
     order by c.name`,
    [req.params.id]
  );

  res.json(result.rows);
});

router.put('/:id/clients', requireAdmin, async (req, res) => {
  const userId = req.params.id;
  const clientIds = Array.isArray(req.body.clientIds) ? req.body.clientIds : [];

  await pool.query('delete from user_clients where user_id = $1', [userId]);
  for (const clientId of clientIds) {
    await pool.query(
      `insert into user_clients (user_id, client_id, created_by)
       values ($1, $2, $3)
       on conflict (user_id, client_id) do nothing`,
      [userId, clientId, req.auth.user.id]
    );
  }

  await logAudit({
    req,
    action: 'user_clients_updated',
    entityType: 'user',
    entityId: userId,
    metadata: { clientIds }
  });

  res.json({ success: true });
});

export default router;
