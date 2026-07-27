# Gestao de Relatorios

## Objetivo

Permitir que administradores e editores cadastrem, editem, filtrem, publiquem e arquivem relatorios por cliente, mantendo um historico navegavel para usuarios com acesso permitido.

O sistema cadastra links externos. Ele nao faz upload nem armazena arquivos de relatorio.

## Funcionalidades prontas

- Cadastro de relatorio por cliente
- Edicao de titulo, descricao, periodo, datas e status
- Filtros por cliente, tipo de periodo, status, data inicial, data final e busca textual
- Detalhe do relatorio selecionado
- Cadastro de multiplos links por relatorio
- Edicao de link, URL, tipo, descricao, ordem e status
- Exclusao de link
- Arquivamento de relatorio
- Validacao de datas, status e tipos aceitos
- Acesso limitado por cliente atribuido
- Viewers veem apenas relatorios publicados

## Campos do relatorio

- Cliente
- Titulo
- Descricao
- Tipo de periodo: diario, semanal, mensal, trimestral, semestral ou anual
- Rotulo do periodo, como `Julho/2026`
- Data inicial
- Data final
- Status: rascunho, publicado ou arquivado

## Campos do link

- Relatorio
- Titulo
- URL HTTPS
- Tipo de destino: Looker Studio, Google Drive, Google Sheets, PDF, apresentacao, dashboard, documento ou outro
- Descricao
- Ordem
- Status: ativo ou inativo

## Regras de permissao

- Admin: gerencia todos os relatorios e links.
- Editor: gerencia relatorios e links dos clientes atribuidos.
- Viewer: consulta apenas relatorios publicados dos clientes atribuidos.

## Regras de historico

- Relatorio removido e arquivado, nao apagado.
- Link removido e excluido, porque pode ser recriado sem comprometer o historico principal.
- Operacoes administrativas registram auditoria.

## Fluxo recomendado de uso

1. Criar ou selecionar o cliente.
2. Criar relatorio com periodo e status inicial.
3. Selecionar o relatorio criado.
4. Adicionar um ou varios links.
5. Revisar os links no detalhe.
6. Publicar quando estiver pronto para o usuario viewer.

## Pendencias futuras

- Reordenacao por arrastar e soltar
- Filtro visual no dashboard do viewer
- Busca global
- Importacao em massa de relatorios e links
- Notificacao por email quando um relatorio for publicado
