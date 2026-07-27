# Desenvolvimento Local

## Requisitos

- Node.js LTS
- npm
- PostgreSQL local

## Instalar dependencias

```bash
npm run install:all
```

Esse comando instala dependencias do frontend e da API em `server/`.

## Variaveis de ambiente

Frontend:

```bash
cp .env.example .env
```

Backend:

```bash
cp server/.env.example server/.env
```

Sessao local padrao:

```txt
SESSION_TTL_HOURS=24
```

Banco local padrao:

```txt
postgres://postgres:postgres@localhost:5432/relatorios_porvir
```

Se o usuario/senha local forem diferentes, ajuste `server/.env`.

## Criar banco local

Exemplo com `createdb`:

```bash
createdb relatorios_porvir
```

O schema e aplicado automaticamente quando a API sobe, porque `server/src/app.js` chama `ensureSchema()`.

Tambem e possivel rodar migrations manualmente:

```bash
npm run db:migrate
```

Para popular dados iniciais de apoio, como o cliente Porvir e um relatorio exemplo em rascunho:

```bash
npm run db:seed
```

## Rodar API

```bash
npm run dev:api
```

API local:

```txt
http://localhost:5101
```

Health check:

```txt
http://localhost:5101/api/health
```

## Rodar frontend

Em outro terminal:

```bash
npm run dev
```

Frontend local:

```txt
http://localhost:5174
```

O Vite envia chamadas `/api` para `http://localhost:5101`, conforme `.env.example`.

## Primeiro acesso

1. Abra `http://localhost:5174`.
2. Se o banco estiver vazio, crie o primeiro admin.
3. Faca login.
4. Cadastre o cliente Porvir.
5. Cadastre relatorios e links.

## Validacao

Rodar build do frontend e checagem sintatica da API:

```bash
npm run check
```

Checar somente API:

```bash
npm run check:api
```

## Migrations

As migrations ficam em:

```txt
server/src/db/migrations/
```

Regras:

- nunca editar migration ja aplicada em producao
- criar uma nova migration para mudancas futuras
- manter `server/src/db/schema.sql` como snapshot de leitura humana
- rodar backup antes de migration em producao

## Observacoes

- `node_modules/`, `dist/` e `.env` nao devem ser commitados.
- O MVP salva links externos, nao arquivos.
- Links externos precisam ter suas permissoes configuradas na ferramenta de origem.
