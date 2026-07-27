# Status de Infraestrutura

## 2026-07-27

Mateus confirmou:

- subdominio `relatorios.porvir.org` apontado para o IP da mesma instancia
- podemos criar a estrutura de pastas que fizer mais sentido
- o usuario do servidor e compartilhado com Mateus e possui permissoes necessarias

Deploy realizado:

- host SSH usado: `ubuntu@56.126.38.231`
- dominio ativo: `https://relatorios.porvir.org`
- app instalado em `/var/www/relatorios_porvir`
- API systemd: `relatorios-porvir-api`
- porta local da API: `5102`
- banco PostgreSQL: `relatorios_porvir`
- Nginx site: `/etc/nginx/sites-available/relatorios.porvir.org`
- HTTPS emitido por Certbot para `relatorios.porvir.org`
- backup diario ativo via `relatorios-porvir-backup.timer`

## Pendencias

- criar admin inicial no primeiro acesso
- cadastrar cliente Porvir
- cadastrar usuarios autorizados
- publicar links iniciais de relatorios
- testar login viewer com usuario atribuido ao Porvir

## Estrutura recomendada

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

Estrutura alternativa para MVP rapido:

```txt
/opt/relatorios-porvir/
  app/
  backups/
  logs/
```
