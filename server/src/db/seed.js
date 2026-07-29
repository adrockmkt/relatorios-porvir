import { pool } from './pool.js';
import { runMigrations } from './migrate.js';
async function seed() {
  await runMigrations();

  const clientId = '00000000-0000-4000-8000-000000000001';
  await pool.query(
    `insert into clients (id, name, slug, logo_url, description, status)
     values ($1, $2, $3, $4, $5, $6)
     on conflict (slug) do update
     set name = excluded.name,
         logo_url = coalesce(clients.logo_url, excluded.logo_url),
         description = coalesce(clients.description, excluded.description),
         status = case when clients.status = 'archived' then clients.status else excluded.status end`,
    [
      clientId,
      'Porvir',
      'porvir',
      '',
      'Cliente inicial para organização dos relatórios publicados pela Ad Rock.',
      'active'
    ]
  );

  const reportId = '00000000-0000-4000-8000-000000000101';
  await pool.query(
    `insert into reports (
       id, client_id, title, description, period_type, period_label, status, published_at, created_by
     ) values ($1, $2, $3, $4, $5, $6, $7, null, null)
     on conflict (id) do nothing`,
    [
      reportId,
      clientId,
      'Relatório exemplo',
      'Registro exemplo para validar a estrutura inicial. Substituir por relatórios reais.',
      'monthly',
      'Exemplo',
      'draft'
    ]
  );

  await pool.query(
    `insert into report_links (id, report_id, title, url, destination_type, description, sort_order, status)
     values ($1, $2, $3, $4, $5, $6, $7, $8)
     on conflict (id) do nothing`,
    [
      '00000000-0000-4000-8000-000000000201',
      reportId,
      'Link exemplo',
      'https://relatorios.porvir.org',
      'dashboard',
      'Trocar pelo link real do relatório.',
      10,
      'inactive'
    ]
  );
}

seed()
  .then(async () => {
    console.log('Seed completed');
    await pool.end();
  })
  .catch(async (error) => {
    console.error('Failed to seed database', error);
    await pool.end();
    process.exit(1);
  });
