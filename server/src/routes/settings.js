import { Router } from 'express';
import { pool } from '../db/pool.js';
import { requireAdmin, requireAuth } from '../middleware/auth.js';
import { logAudit } from '../utils/audit.js';

const router = Router();

router.get('/public-brand', async (_req, res) => {
  const appSettings = await loadBrandSettings();
  res.json(toBrandSettings(appSettings));
});

router.use(requireAuth);

router.get('/', async (_req, res) => {
  const appSettings = await loadBrandSettings();
  res.json({
    brand: toBrandSettings(appSettings)
  });
});

router.put('/brand', requireAdmin, async (req, res) => {
  const appName = String(req.body.appName || '').trim();
  const slogan = String(req.body.slogan || '').trim();
  const topLogoUrl = String(req.body.topLogoUrl || '').trim();

  if (!appName || appName.length > 80) {
    return res.status(400).json({ error: 'O nome do sistema deve ter entre 1 e 80 caracteres.' });
  }

  if (slogan.length > 140) {
    return res.status(400).json({ error: 'O slogan deve ter ate 140 caracteres.' });
  }

  if (topLogoUrl && !isValidLogoUrl(topLogoUrl)) {
    return res.status(400).json({ error: 'Informe uma URL de logo valida ou um data URL de imagem.' });
  }

  await upsertSetting('app_name', appName, req.auth.user.id);
  await upsertSetting('app_slogan', slogan, req.auth.user.id);
  await upsertSetting('top_logo_url', topLogoUrl || '/adrock-logo.png', req.auth.user.id);

  await logAudit({
    req,
    action: 'brand_updated',
    entityType: 'app_setting',
    entityId: 'brand',
    metadata: { appName, slogan, topLogoUrl }
  });

  res.json({ success: true });
});

async function upsertSetting(key, value, userId) {
  await pool.query(
    `insert into app_settings (key, value, updated_by, updated_at)
     values ($1, $2, $3, now())
     on conflict (key) do update
     set value = excluded.value,
         updated_by = excluded.updated_by,
         updated_at = now()`,
    [key, value, userId]
  );
}

async function loadBrandSettings() {
  const result = await pool.query(
    `select key, value
     from app_settings
     where key in ('top_logo_url', 'app_name', 'app_slogan')`
  );
  return Object.fromEntries(result.rows.map((row) => [row.key, row.value]));
}

function toBrandSettings(appSettings) {
  return {
    appName: appSettings.app_name || 'Porvir Reports Hub',
    slogan: appSettings.app_slogan || 'Historico de relatorios e entregas Ad Rock',
    topLogoUrl: appSettings.top_logo_url || '/adrock-logo.png',
    topLogoSize: 56
  };
}

function isValidLogoUrl(value) {
  return /^https:\/\//i.test(value) || /^data:image\/(png|jpeg|webp|gif);base64,/i.test(value) || value.startsWith('/');
}

export default router;
