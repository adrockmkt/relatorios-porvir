# Produto

# Porvir Reports Hub

## Problema

Relatorios produzidos diariamente, semanalmente, mensalmente e em outros ciclos ficam distribuidos em varios locais. Isso dificulta compartilhar o historico com clientes e pessoas especificas, como "Regiany, os relatorios estao prontos la no repositorio".

## Solucao

Um portal privado onde a Ad Rock cadastra clientes, usuarios e links de relatorios por periodo.

## Publicos

### Admin Ad Rock

Gerencia sistema, usuarios, clientes, permissoes, marca e auditoria.

### Editor Ad Rock

Cadastra e atualiza relatorios e links.

### Viewer cliente

Acessa somente os clientes e relatorios atribuidos ao seu login.

## Funcionalidades

### Autenticacao

- setup inicial do admin
- login
- logout
- sessoes com expiracao
- troca de senha por admin
- inativacao de usuario

### Clientes

- cadastrar cliente
- editar cliente
- excluir cliente quando nao houver dependencias ou arquivar/inativar
- cadastrar logo
- editar nome
- editar descricao
- status ativo/inativo

### Permissoes

- vincular usuario a um ou varios clientes
- usuario viewer so ve clientes atribuidos
- usuario editor/admin pode operar conforme papel

### Relatorios

- cadastrar relatorio
- editar relatorio
- arquivar relatorio
- excluir com confirmacao e auditoria
- filtrar por cliente, periodo, status e data

### Links

- cadastrar um ou varios links por relatorio
- editar link
- excluir link
- ordenar links
- classificar destino

Tipos de destino sugeridos:

- Looker Studio
- Google Drive
- Google Sheets
- PDF
- Apresentacao
- Dashboard
- Documento
- Outro

### Branding

- editar logo do topo
- editar titulo
- editar slogan
- editar nome da instalacao

## Requisitos fundamentais

- Tudo que pode ser cadastrado deve poder ser editado.
- Toda exclusao relevante deve pedir confirmacao.
- Quando exclusao afetar historico, preferir arquivar.
- Operacoes administrativas devem ser auditadas.
- O sistema deve funcionar bem em desktop e mobile.

## Fora do escopo do MVP

- Upload e hospedagem de arquivos
- Edicao de relatorios dentro do sistema
- Automacao de captura dos links
- Permissao granular por link individual
- Notificacoes por email
