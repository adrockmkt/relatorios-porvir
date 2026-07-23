# Schema do Banco

Banco recomendado: PostgreSQL.

## Tabelas

### users

Usuarios que acessam o sistema.

Campos:

- `id`
- `name`
- `email`
- `password_hash`
- `role`: `admin`, `editor`, `viewer`
- `status`: `active`, `inactive`
- `created_at`
- `updated_at`

### sessions

Sessoes de login.

Campos:

- `token`
- `user_id`
- `expires_at`
- `created_at`

### clients

Clientes cadastrados.

Campos:

- `id`
- `name`
- `slug`
- `logo_url`
- `description`
- `status`: `active`, `inactive`, `archived`
- `created_by`
- `created_at`
- `updated_at`

### user_clients

Vinculo entre usuarios e clientes.

Campos:

- `user_id`
- `client_id`
- `created_by`
- `created_at`

Chave unica:

- `user_id`, `client_id`

### reports

Relatorios cadastrados.

Campos:

- `id`
- `client_id`
- `title`
- `description`
- `period_type`: `daily`, `weekly`, `monthly`, `quarterly`, `semiannual`, `annual`
- `period_label`
- `starts_at`
- `ends_at`
- `reference_year`
- `reference_month`
- `status`: `draft`, `published`, `archived`
- `published_at`
- `created_by`
- `created_at`
- `updated_at`

### report_links

Links pertencentes a um relatorio.

Campos:

- `id`
- `report_id`
- `title`
- `url`
- `destination_type`: `looker_studio`, `google_drive`, `google_sheets`, `pdf`, `presentation`, `dashboard`, `document`, `other`
- `description`
- `sort_order`
- `status`: `active`, `inactive`
- `created_by`
- `created_at`
- `updated_at`

### app_settings

Configuracoes globais editaveis.

Campos:

- `key`
- `value`
- `updated_by`
- `updated_at`

Chaves sugeridas:

- `brand.app_name`
- `brand.top_logo_url`
- `brand.slogan`
- `brand.owner_name`

### audit_logs

Auditoria de acoes importantes.

Campos:

- `id`
- `actor_user_id`
- `action`
- `entity_type`
- `entity_id`
- `metadata`
- `ip_address`
- `user_agent`
- `created_at`

## Indices sugeridos

- `users.email`
- `clients.slug`
- `reports.client_id`
- `reports.period_type`
- `reports.starts_at`
- `reports.ends_at`
- `reports.status`
- `report_links.report_id`
- `audit_logs.created_at`
