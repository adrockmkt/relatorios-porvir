# Deploy AWS Lightsail

## Dominio

Dominio alvo:

`relatorios.porvir.org`

Status em 2026-07-27: Mateus confirmou que o subdominio ja foi apontado para o IP da mesma instancia Lightsail.

Observacao operacional: o usuario disponivel no servidor e o mesmo usado pelo Mateus e possui permissoes para criar a estrutura de pastas necessaria.

## Infraestrutura inicial

- AWS Lightsail
- Ubuntu LTS
- 1 instancia pequena para MVP
- PostgreSQL local
- Nginx como proxy reverso
- Node.js para API
- frontend buildado como arquivos estaticos
- Certbot para HTTPS

## Portas

- `80`: HTTP, redireciona para HTTPS
- `443`: HTTPS
- API local: `127.0.0.1:5002` ou porta definida em `.env`
- PostgreSQL: acesso local apenas

## Estrutura sugerida no servidor

```txt
/opt/relatorios-porvir/
  current/
  releases/
  shared/
    .env
    server.env
    backups/
    logs/
```

Para MVP, tambem e aceitavel uma estrutura mais simples:

```txt
/opt/relatorios-porvir/
  app/
  backups/
  logs/
```

Recomendacao: usar `current/`, `releases/` e `shared/` se quisermos rollback mais limpo; usar `app/` se a prioridade for velocidade inicial.

## Variaveis de ambiente

Backend:

- `NODE_ENV=production`
- `PORT=5002`
- `DATABASE_URL=postgres://...`
- `SESSION_TTL_HOURS=...`
- `CORS_ORIGIN=https://relatorios.porvir.org`
- `UPLOAD_DIR=/var/www/relatorios_porvir/uploads`

Frontend:

- `VITE_API_BASE_URL=https://relatorios.porvir.org/api`

## Processo de deploy

1. Criar estrutura de pastas em `/opt/relatorios-porvir/`
2. Clonar repositorio `adrockmkt/relatorios-porvir.git`
3. Instalar dependencias do frontend e backend
4. Configurar `.env`
5. Rodar migrations do banco
6. Buildar frontend
7. Configurar Nginx
8. Configurar systemd para API
9. Ativar HTTPS com Certbot
10. Configurar backup diario
11. Criar admin inicial no primeiro acesso

## Deploy atual em producao

Status em 2026-07-27:

- URL: `https://relatorios.porvir.org`
- app: `/var/www/relatorios_porvir`
- API: `relatorios-porvir-api`
- porta local: `5102`
- banco: `relatorios_porvir`
- backup diario: `relatorios-porvir-backup.timer`
- uploads de logos: `/var/www/relatorios_porvir/uploads`
- health: `https://relatorios.porvir.org/api/health`

Arquivos versionados para repetir a instalacao:

- `deploy/lightsail-deploy.sh`
- `deploy/nginx/relatorios.porvir.org`
- `deploy/systemd/relatorios-porvir-api.service`
- `deploy/systemd/relatorios-porvir-backup.service`
- `deploy/systemd/relatorios-porvir-backup.timer`
- `deploy/scripts/relatorios-porvir-backup.sh`

## Backup

Backup diario com `pg_dump`, mantendo retencao minima de 14 a 30 dias.

## Rollback

- manter releases versionadas
- antes de deploy, fazer backup do banco
- se falhar, voltar build anterior e reiniciar systemd
