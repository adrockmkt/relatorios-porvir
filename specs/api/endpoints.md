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
- `GET /clients/:id`
- `PATCH /clients/:id`
- `PATCH /clients/:id/status`
- `DELETE /clients/:id`

## Permissoes usuario-cliente

- `GET /users/:id/clients`
- `PUT /users/:id/clients`
- `GET /clients/:id/users`

## Relatorios

- `GET /reports`
- `POST /reports`
- `GET /reports/:id`
- `PATCH /reports/:id`
- `PATCH /reports/:id/status`
- `DELETE /reports/:id`

Filtros esperados em `GET /reports`:

- `clientId`
- `periodType`
- `status`
- `dateFrom`
- `dateTo`
- `search`

## Links de relatorio

- `GET /reports/:reportId/links`
- `POST /reports/:reportId/links`
- `PATCH /report-links/:id`
- `DELETE /report-links/:id`
- `PUT /reports/:reportId/links/order`

## Configuracoes

- `GET /settings/public-brand`
- `GET /settings`
- `PATCH /settings/brand`

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
