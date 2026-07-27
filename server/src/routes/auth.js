import { Router } from 'express';
import { pool } from '../db/pool.js';
import { logAudit } from '../utils/audit.js';
import { createSessionExpiry, generateId, generateToken, hashPassword, isStrongEnoughPassword, isValidEmail, normalizeEmail, verifyPassword } from '../utils/security.js';

const router = Router();

router.get('/setup-status', async (_req, res) => {
  const result = await pool.query('select count(*)::int as total from users');
  res.json({
    setupRequired: result.rows[0].total === 0
  });
});

router.post('/setup', async (req, res) => {
  const countResult = await pool.query('select count(*)::int as total from users');
  if (countResult.rows[0].total > 0) {
    return res.status(409).json({ error: 'Setup inicial já foi concluído.' });
  }

  const { name, email, password } = req.body;
  const normalizedName = String(name || '').trim();
  const normalizedEmail = normalizeEmail(email);

  if (!normalizedName || !normalizedEmail || !password) {
    return res.status(400).json({ error: 'Nome, email e senha são obrigatórios.' });
  }

  if (!isValidEmail(normalizedEmail)) {
    return res.status(400).json({ error: 'Informe um email válido.' });
  }

  if (!isStrongEnoughPassword(password)) {
    return res.status(400).json({ error: 'A senha deve ter pelo menos 8 caracteres.' });
  }

  const userId = generateId();
  const passwordHash = hashPassword(password);
  await pool.query(
    'insert into users (id, name, email, password_hash, role, status) values ($1, $2, $3, $4, $5, $6)',
    [userId, normalizedName, normalizedEmail, passwordHash, 'admin', 'active']
  );
  await logAudit({
    req,
    actorUserId: userId,
    action: 'setup_admin_created',
    entityType: 'user',
    entityId: userId,
    metadata: { email: normalizedEmail }
  });

  const token = generateToken();
  const expiresAt = createSessionExpiry();
  await pool.query(
    'insert into sessions (token, user_id, expires_at) values ($1, $2, $3)',
    [token, userId, expiresAt]
  );

  res.status(201).json({
    message: 'Administrador inicial criado com sucesso.',
    token,
    expiresAt,
    user: {
      id: userId,
      name: normalizedName,
      email: normalizedEmail,
      role: 'admin',
      isAdmin: true
    }
  });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const normalizedEmail = normalizeEmail(email);

  if (!normalizedEmail || !password) {
    return res.status(400).json({ error: 'Email e senha são obrigatórios.' });
  }

  if (!isValidEmail(normalizedEmail)) {
    return res.status(400).json({ error: 'Informe um email válido.' });
  }

  const result = await pool.query(
    'select id, name, email, password_hash, role, status from users where email = $1',
    [normalizedEmail]
  );

  const user = result.rows[0];
  if (!user || !verifyPassword(password, user.password_hash)) {
    await logAudit({
      req,
      action: 'login_failed',
      entityType: 'session',
      metadata: { email: normalizedEmail }
    });
    return res.status(401).json({ error: 'Credenciais inválidas.' });
  }

  if (user.status !== 'active') {
    await logAudit({
      req,
      actorUserId: user.id,
      action: 'login_inactive_user',
      entityType: 'session',
      metadata: { email: user.email }
    });
    return res.status(403).json({ error: 'Usuário inativo.' });
  }

  const token = generateToken();
  const expiresAt = createSessionExpiry();
  await pool.query(
    'insert into sessions (token, user_id, expires_at) values ($1, $2, $3)',
    [token, user.id, expiresAt]
  );
  await logAudit({
    req,
    actorUserId: user.id,
    action: 'login_success',
    entityType: 'session',
    entityId: token.slice(0, 12),
    metadata: { email: user.email, expiresAt }
  });

  res.json({
    token,
    expiresAt,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isAdmin: user.role === 'admin'
    }
  });
});

router.get('/me', async (req, res) => {
  const authorization = req.headers.authorization || '';
  const token = authorization.startsWith('Bearer ') ? authorization.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: 'Token ausente.' });
  }

  const result = await pool.query(
    `select s.token, s.expires_at, u.id, u.name, u.email, u.role, u.status
     from sessions s
     join users u on u.id = s.user_id
     where s.token = $1`,
    [token]
  );

  const session = result.rows[0];
  if (!session) {
    return res.status(401).json({ error: 'Sessão inválida.' });
  }

  if (new Date(session.expires_at).getTime() < Date.now()) {
    await pool.query('delete from sessions where token = $1', [token]);
    return res.status(401).json({ error: 'Sessão expirada.' });
  }

  res.json({
    user: {
      id: session.id,
      name: session.name,
      email: session.email,
      role: session.role,
      isAdmin: session.role === 'admin'
    }
  });
});

router.post('/logout', async (req, res) => {
  const authorization = req.headers.authorization || '';
  const token = authorization.startsWith('Bearer ') ? authorization.slice(7) : null;

  if (token) {
    const result = await pool.query('delete from sessions where token = $1 returning user_id', [token]);
    await logAudit({
      req,
      actorUserId: result.rows[0]?.user_id || null,
      action: 'logout',
      entityType: 'session',
      entityId: token.slice(0, 12)
    });
  }

  res.json({ success: true });
});

export default router;
