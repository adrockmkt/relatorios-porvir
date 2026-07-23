# Plano de Implementacao

## Objetivo

Construir o MVP do Porvir Reports Hub usando como referencia tecnica e visual o `utm_builder`.

## Fase 1 - Fundacao do projeto

### Entregas

- inicializar repositorio local
- configurar remote `https://github.com/adrockmkt/relatorios-porvir.git`
- criar frontend React/Vite/TypeScript
- criar backend Node.js/Express
- configurar Tailwind
- adicionar logo base
- criar `.env.example` do frontend e backend

### Criterios de aceite

- `npm run dev` sobe frontend local
- API responde `/api/health`
- estrutura de pastas segue a documentacao

## Fase 2 - Banco e autenticacao

### Entregas

- schema PostgreSQL
- conexao com banco
- setup inicial do admin
- login
- logout
- rota `/auth/me`
- middleware de autenticacao

### Criterios de aceite

- primeiro acesso cria admin
- usuario consegue entrar e sair
- sessao expirada bloqueia acesso
- senha nao e salva em texto puro

## Fase 3 - Usuarios, clientes e permissoes

### Entregas

- CRUD de usuarios
- CRUD de clientes
- vinculo usuario-cliente
- roles `admin`, `editor`, `viewer`
- inativacao de usuario
- arquivamento de cliente

### Criterios de aceite

- admin cadastra e edita usuario
- admin troca senha
- admin atribui cliente ao usuario
- viewer ve apenas cliente atribuido

## Fase 4 - Relatorios e links

### Entregas

- CRUD de relatorios
- CRUD de links por relatorio
- filtros por cliente, periodo, status e data
- detalhe do relatorio
- ordenacao de links
- publicacao e arquivamento

### Criterios de aceite

- editor cria relatorio com multiplos links
- viewer ve relatorios publicados
- rascunhos ficam ocultos para viewer
- exclusoes relevantes registram auditoria

## Fase 5 - Branding e dashboard

### Entregas

- topo editavel
- titulo editavel
- slogan editavel
- logo do sistema por URL
- dashboard do cliente
- cards de resumo
- estados vazios

### Criterios de aceite

- admin altera marca sem codigo
- usuario com um cliente cai direto no dashboard dele
- dashboard mostra historico por periodo

## Fase 6 - Deploy

### Entregas

- build de producao
- Nginx
- systemd
- HTTPS
- PostgreSQL em producao
- backup diario
- documentacao de operacao

### Criterios de aceite

- `https://relatorios.porvir.org` abre o sistema
- login funciona em producao
- backup diario gera arquivo
- API nao fica exposta fora do proxy esperado

## Ordem recomendada de implementacao

1. Copiar/adaptar base do `utm_builder`
2. Remover dominio UTM
3. Criar schema de relatorios
4. Adaptar auth e usuarios
5. Implementar clientes
6. Implementar relatorios
7. Implementar links
8. Implementar dashboard viewer
9. Implementar area admin
10. Preparar deploy

## Riscos

- Links externos podem estar publicos fora do portal.
- Permissoes do Looker/Drive precisam ser alinhadas com o cliente.
- Exclusao definitiva pode apagar historico util.
- Subdominio depende de DNS apontado corretamente.

## Mitigacoes

- Preferir arquivamento a exclusao.
- Exibir aviso sobre permissao externa dos links.
- Registrar auditoria administrativa.
- Testar DNS e HTTPS antes de liberar para cliente.
