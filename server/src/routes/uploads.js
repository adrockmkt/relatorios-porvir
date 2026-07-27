import { Router } from 'express';
import fs from 'node:fs/promises';
import path from 'node:path';
import { env } from '../config/env.js';
import { requireAuth } from '../middleware/auth.js';
import { logAudit } from '../utils/audit.js';
import { requireEditorRole } from '../utils/permissions.js';
import { generateId } from '../utils/security.js';

const router = Router();
const MAX_IMAGE_BYTES = 2 * 1024 * 1024;
const MIME_EXTENSIONS = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/svg+xml': 'svg'
};

router.use(requireAuth);

router.post('/images', requireEditorRole, async (req, res) => {
  const fileName = String(req.body.fileName || 'logo').trim();
  const mimeType = String(req.body.mimeType || '').toLowerCase();
  const dataUrl = String(req.body.dataUrl || '');
  const extension = MIME_EXTENSIONS[mimeType];

  if (!extension) {
    return res.status(400).json({ error: 'Use imagem PNG, JPG, WebP, GIF ou SVG.' });
  }

  const prefix = `data:${mimeType};base64,`;
  if (!dataUrl.startsWith(prefix)) {
    return res.status(400).json({ error: 'Arquivo de imagem invalido.' });
  }

  const buffer = Buffer.from(dataUrl.slice(prefix.length), 'base64');
  if (!buffer.length || buffer.length > MAX_IMAGE_BYTES) {
    return res.status(400).json({ error: 'A imagem deve ter ate 2 MB.' });
  }

  const safeBaseName = slugify(path.parse(fileName).name || 'logo').slice(0, 60) || 'logo';
  const storedName = `${Date.now()}-${generateId()}-${safeBaseName}.${extension}`;
  const targetDir = path.resolve(env.uploadDir, 'logos');
  const targetPath = path.join(targetDir, storedName);

  await fs.mkdir(targetDir, { recursive: true });
  await fs.writeFile(targetPath, buffer, { flag: 'wx' });

  const url = `/uploads/logos/${storedName}`;
  await logAudit({
    req,
    action: 'image_uploaded',
    entityType: 'upload',
    entityId: storedName,
    metadata: { fileName, mimeType, size: buffer.length, url }
  });

  res.status(201).json({ url });
});

function slugify(value) {
  return String(value || 'logo')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export default router;
