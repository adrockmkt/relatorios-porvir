# API

Base path: `/api`

## Auth

- `GET /auth/setup-status`
- `POST /auth/setup`
- `POST /auth/login`
- `GET /auth/me`
- `POST /auth/logout`

## Usuarios

- `GET /users`
- `POST /users`
- `PATCH /users/:id`
- `PATCH /users/:id/password`
- `PATCH /users/:id/status`
- `DELETE /users/:id`

## Clientes

- `GET /clients`
- `POST /clients`
- `PATCH /clients/:id`
- `DELETE /clients/:id`
- `GET /clients/:id/users`
- `PUT /clients/:id/users`

## Permissoes usuario-cliente

- `GET /users/:id/clients`
- `PUT /users/:id/clients`
- `GET /clients/:id/users`

## Relatorios

- `GET /reports`
- `POST /reports`
- `GET /reports/:id`
- `PATCH /reports/:id`
- `DELETE /reports/:id`

Filtros esperados em `GET /reports`:

- `clientId`
- `periodType`
- `status`
- `dateFrom`
- `dateTo`
- `search`

## Links de relatorio

- `POST /report-links`
- `PATCH /report-links/:id`
- `DELETE /report-links/:id`

Observacao: `GET /reports/:id` retorna os links do relatorio no campo `links`.

## Configuracoes

- `GET /settings/public-brand`
- `GET /settings`
- `PUT /settings/brand`

## Auditoria

- `GET /audit-logs`

Filtros:

- `actorUserId`
- `entityType`
- `action`
- `dateFrom`
- `dateTo`

## Health

- `GET /health`
