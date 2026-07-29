-- Snapshot do schema atual para leitura humana.
-- A aplicacao executa migrations versionadas em server/src/db/migrations/.

create table if not exists schema_migrations (
  id text primary key,
  applied_at timestamptz not null default now()
);

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create table if not exists users (
  id uuid primary key,
  name text not null,
  email text not null unique,
  password_hash text not null,
  role text not null check (role in ('admin', 'editor', 'viewer')),
  status text not null default 'active' check (status in ('active', 'inactive')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists sessions (
  token text primary key,
  user_id uuid not null references users(id) on delete cascade,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create table if not exists clients (
  id uuid primary key,
  name text not null,
  slug text not null unique,
  logo_url text,
  description text,
  status text not null default 'active' check (status in ('active', 'inactive', 'archived')),
  created_by uuid references users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists user_clients (
  user_id uuid not null references users(id) on delete cascade,
  client_id uuid not null references clients(id) on delete cascade,
  created_by uuid references users(id) on delete set null,
  created_at timestamptz not null default now(),
  primary key (user_id, client_id)
);

create table if not exists reports (
  id uuid primary key,
  client_id uuid not null references clients(id) on delete cascade,
  title text not null,
  description text,
  period_type text not null check (period_type in ('daily', 'weekly', 'monthly', 'quarterly', 'semiannual', 'annual')),
  period_label text,
  starts_at date,
  ends_at date,
  reference_year int check (reference_year is null or reference_year between 2000 and 2100),
  reference_month int check (reference_month is null or reference_month between 1 and 12),
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  published_at timestamptz,
  created_by uuid references users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (starts_at is null or ends_at is null or starts_at <= ends_at)
);

create table if not exists report_links (
  id uuid primary key,
  report_id uuid not null references reports(id) on delete cascade,
  title text not null,
  url text not null check (url ~* '^https://'),
  destination_type text not null default 'other' check (destination_type in ('looker_studio', 'google_drive', 'google_sheets', 'pdf', 'presentation', 'dashboard', 'document', 'other')),
  description text,
  sort_order int not null default 0,
  status text not null default 'active' check (status in ('active', 'inactive')),
  created_by uuid references users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists app_settings (
  key text primary key,
  value text not null,
  updated_by uuid references users(id) on delete set null,
  updated_at timestamptz not null default now()
);

create table if not exists audit_logs (
  id uuid primary key,
  actor_user_id uuid references users(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id text,
  metadata jsonb not null default '{}'::jsonb,
  ip_address text,
  user_agent text,
  created_at timestamptz not null default now()
);

create index if not exists users_email_idx on users (email);
create index if not exists clients_slug_idx on clients (slug);
create index if not exists clients_status_idx on clients (status);
create index if not exists user_clients_client_id_idx on user_clients (client_id);
create index if not exists reports_client_id_idx on reports (client_id);
create index if not exists reports_period_type_idx on reports (period_type);
create index if not exists reports_status_idx on reports (status);
create index if not exists reports_starts_at_idx on reports (starts_at desc);
create index if not exists report_links_report_id_idx on report_links (report_id, sort_order);
create index if not exists audit_logs_created_at_idx on audit_logs (created_at desc);
create index if not exists audit_logs_actor_user_id_idx on audit_logs (actor_user_id);
create index if not exists audit_logs_entity_idx on audit_logs (entity_type, entity_id);

drop trigger if exists users_set_updated_at on users;
create trigger users_set_updated_at
before update on users
for each row execute function set_updated_at();

drop trigger if exists clients_set_updated_at on clients;
create trigger clients_set_updated_at
before update on clients
for each row execute function set_updated_at();

drop trigger if exists reports_set_updated_at on reports;
create trigger reports_set_updated_at
before update on reports
for each row execute function set_updated_at();

drop trigger if exists report_links_set_updated_at on report_links;
create trigger report_links_set_updated_at
before update on report_links
for each row execute function set_updated_at();

drop trigger if exists app_settings_set_updated_at on app_settings;
create trigger app_settings_set_updated_at
before update on app_settings
for each row execute function set_updated_at();

insert into app_settings (key, value)
values
  ('app_name', 'Porvir Reports Hub'),
  ('app_slogan', 'Histórico de relatórios e entregas Ad Rock'),
  ('top_logo_url', '/adrock-logo.png')
on conflict (key) do nothing;
