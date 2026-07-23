# Deploy AWS Lightsail

## Dominio

Dominio alvo:

`relatorios.porvir.org`

O subdominio deve apontar para o IP publico da instancia Lightsail.

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
  app/
  server/
  backups/
  logs/
```

## Variaveis de ambiente

Backend:

- `NODE_ENV=production`
- `PORT=5002`
- `DATABASE_URL=postgres://...`
- `SESSION_TTL_HOURS=...`
- `CORS_ORIGIN=https://relatorios.porvir.org`

Frontend:

- `VITE_API_BASE_URL=https://relatorios.porvir.org/api`

## Processo de deploy

1. Clonar repositorio `adrockmkt/relatorios-porvir.git`
2. Instalar dependencias do frontend e backend
3. Configurar `.env`
4. Rodar migracoes/schema do banco
5. Buildar frontend
6. Configurar Nginx
7. Configurar systemd para API
8. Ativar HTTPS com Certbot
9. Configurar backup diario
10. Criar admin inicial no primeiro acesso

## Backup

Backup diario com `pg_dump`, mantendo retencao minima de 14 a 30 dias.

## Rollback

- manter releases versionadas
- antes de deploy, fazer backup do banco
- se falhar, voltar build anterior e reiniciar systemd
