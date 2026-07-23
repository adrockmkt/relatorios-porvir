import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env.js';
import { ensureSchema } from './db/init.js';
import auditLogRoutes from './routes/auditLogs.js';
import authRoutes from './routes/auth.js';
import clientRoutes from './routes/clients.js';
import healthRoutes from './routes/health.js';
import reportLinkRoutes from './routes/reportLinks.js';
import reportRoutes from './routes/reports.js';
import settingsRoutes from './routes/settings.js';
import userRoutes from './routes/users.js';

const app = express();

app.set('trust proxy', 1);
app.use(helmet());
app.use(cors({ origin: env.corsOrigin, credentials: false }));
app.use(rateLimit({
  windowMs: env.rateLimitWindowMs,
  max: env.rateLimitMax,
  standardHeaders: true,
  legacyHeaders: false
}));
app.use(morgan(env.nodeEnv === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '4mb' }));

app.get('/', (_req, res) => {
  res.json({
    name: 'Porvir Reports Hub API',
    mode: 'single-tenant',
    awsReady: true
  });
});

app.use('/api/health', healthRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/report-links', reportLinkRoutes);
app.use('/api/audit-logs', auditLogRoutes);

async function start() {
  await ensureSchema();

  app.listen(env.port, () => {
    console.log(`Reports Hub API listening on port ${env.port}`);
  });
}

start().catch((error) => {
  console.error('Failed to start Reports Hub API', error);
  process.exit(1);
});
