# Banco de Dados

## Banco

PostgreSQL.

Database local recomendada:

```txt
relatorios_porvir
```

## Migrations

As migrations versionadas ficam em:

```txt
server/src/db/migrations/
```

A API executa migrations automaticamente ao iniciar por meio de:

```txt
server/src/db/init.js
```

Tambem e possivel executar manualmente:

```bash
npm run db:migrate
```

## Seed

Seed opcional:

```bash
npm run db:seed
```

O seed cria:

- cliente `Porvir`
- um relatorio exemplo em rascunho
- um link exemplo inativo

O seed nao cria usuario admin. O admin inicial deve ser criado pela tela de setup no primeiro acesso.

## Tabelas principais

- `users`
- `sessions`
- `clients`
- `user_clients`
- `reports`
- `report_links`
- `app_settings`
- `audit_logs`
- `schema_migrations`

## Constraints importantes

- usuarios possuem email unico
- usuarios possuem role controlada: `admin`, `editor`, `viewer`
- clientes possuem slug unico
- relatorios possuem periodo controlado
- relatorios nao podem ter data final anterior a data inicial
- `reference_month` deve ficar entre 1 e 12
- links de relatorio exigem URL `https://`
- links possuem tipo de destino controlado

## Snapshot

O arquivo abaixo e um snapshot legivel do schema atual:

```txt
server/src/db/schema.sql
```

Ele nao substitui migrations. Mudancas futuras devem entrar em nova migration.

## Producao

Antes de migration em producao:

1. Fazer backup do PostgreSQL.
2. Confirmar variaveis do `.env`.
3. Rodar `npm --prefix server run migrate`.
4. Validar `/api/health`.
5. Testar login e listagem de relatorios.
