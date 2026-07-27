# Porvir Reports Hub

Portal privado para organizar, publicar e consultar links de relatorios da Ad Rock para o Porvir e outros clientes.

## Objetivo

Centralizar o historico de relatorios diarios, semanais, mensais, trimestrais, semestrais e anuais em um ambiente com login e senha, onde cada usuario acessa apenas os clientes atribuidos a ele.

O sistema nao armazena arquivos de relatorio. Ele cadastra links externos que apontam para Looker Studio, Google Drive, Google Sheets, PDFs, dashboards, apresentações, documentos ou qualquer outro destino usado na entrega.

## Nome do produto

- Produto base: **Ad Rock Reports Hub**
- Instalacao Porvir: **Porvir Reports Hub**
- Design system: **Ad Rock Console UI**
- Dominio alvo: `relatorios.porvir.org`

## Principios

- Tudo deve ser editavel e cadastravel por usuarios autorizados.
- O usuario final deve cair direto no cliente atribuido quando tiver acesso a apenas um cliente.
- O historico deve ser facil de filtrar por periodo, cliente, data, tipo de relatorio e status.
- Links podem ser um ou varios por relatorio.
- A interface deve reaproveitar a linguagem visual do `utm_builder`.
- O deploy inicial deve ser simples, com AWS Lightsail, Nginx, Node.js e PostgreSQL.

## Stack recomendada

- Frontend: React, Vite, TypeScript, Tailwind
- Backend: Node.js, Express
- Banco: PostgreSQL
- Auth: login proprio com senha hash e sessoes/token
- Deploy: AWS Lightsail
- Proxy: Nginx
- Processo: systemd
- Backup: dump diario do PostgreSQL

## Estrutura documental

- [design.md](./design.md): especificacao visual e UX para IA e humanos
- [design/DESIGN.md](./design/DESIGN.md): tokens e componentes do Ad Rock Console UI
- [docs/LOCAL_DEVELOPMENT.md](./docs/LOCAL_DEVELOPMENT.md): como rodar o projeto localmente
- [docs/DATABASE.md](./docs/DATABASE.md): migrations, seed e operacao do PostgreSQL
- [docs/PRODUCT.md](./docs/PRODUCT.md): visao funcional do produto
- [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md): arquitetura tecnica
- [docs/DEPLOYMENT_LIGHTSAIL.md](./docs/DEPLOYMENT_LIGHTSAIL.md): plano de deploy em `relatorios.porvir.org`
- [docs/INFRA_STATUS.md](./docs/INFRA_STATUS.md): status do subdominio e pendencias de servidor
- [docs/SECURITY.md](./docs/SECURITY.md): seguranca, permissoes e riscos
- [docs/ROADMAP.md](./docs/ROADMAP.md): fases de entrega
- [specs/database/schema.md](./specs/database/schema.md): modelo de dados
- [specs/api/endpoints.md](./specs/api/endpoints.md): endpoints esperados
- [specs/frontend/user-flows.md](./specs/frontend/user-flows.md): telas e fluxos

## MVP

1. Setup inicial do admin
2. Login e logout
3. CRUD de usuarios
4. CRUD de clientes
5. Vinculo usuario-cliente
6. CRUD de relatorios
7. CRUD de links por relatorio
8. Dashboard do cliente com filtros por periodo
9. Branding editavel do topo
10. Deploy no Lightsail em `relatorios.porvir.org`

## Desenvolvimento local

Instalar dependencias:

```bash
npm run install:all
```

Rodar API:

```bash
npm run dev:api
```

Rodar migrations:

```bash
npm run db:migrate
```

Rodar frontend:

```bash
npm run dev
```

Validar build e API:

```bash
npm run check
```

Detalhes em [docs/LOCAL_DEVELOPMENT.md](./docs/LOCAL_DEVELOPMENT.md).

## Observacao de seguranca

Este portal controla o acesso ao catalogo de links. Se o destino do link externo estiver publico, qualquer pessoa com o link podera abrir fora do portal. Para controle total, os relatorios externos tambem devem ter permissao configurada no Google Drive, Looker Studio ou ferramenta equivalente.
