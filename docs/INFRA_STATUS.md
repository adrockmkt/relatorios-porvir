# Status de Infraestrutura

## 2026-07-27

Mateus confirmou:

- subdominio `relatorios.porvir.org` apontado para o IP da mesma instancia
- podemos criar a estrutura de pastas que fizer mais sentido
- o usuario do servidor e compartilhado com Mateus e possui permissoes necessarias

## Pendencias

- validar propagacao DNS
- confirmar acesso SSH
- criar estrutura de deploy no servidor
- instalar/configurar Node.js, PostgreSQL, Nginx e Certbot se ainda nao estiverem prontos
- configurar HTTPS
- configurar systemd da API
- configurar backup diario do PostgreSQL

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
