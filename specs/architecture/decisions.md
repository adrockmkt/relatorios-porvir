# Decisoes Arquiteturais

## ADR 001 - Links em vez de arquivos

O sistema salva links externos e nao faz upload de arquivos no MVP.

Motivo:

- menor custo
- menor risco
- deploy mais simples
- relatorios continuam nas ferramentas originais

## ADR 002 - PostgreSQL

PostgreSQL sera o banco principal.

Motivo:

- confiavel
- adequado para filtros e relacionamentos
- facil backup
- ja usado como recomendacao no projeto `utm_builder`

## ADR 003 - Ad Rock Console UI

O design system do projeto sera chamado **Ad Rock Console UI**.

Motivo:

- reaproveita o estilo aprovado do `utm_builder`
- comunica painel operacional
- pode virar padrao para outros sistemas internos da Ad Rock

## ADR 004 - CRUD completo

Toda entidade operacional deve permitir cadastrar, editar, arquivar/inativar e excluir quando seguro.

Motivo:

- erros de cadastro vao acontecer
- links mudam
- clientes e usuarios podem mudar
- o sistema precisa ser operavel sem desenvolvedor

## ADR 005 - Subdominio Porvir

O dominio inicial de producao sera `relatorios.porvir.org`.

Motivo:

- URL clara para usuarios do Porvir
- separacao do UTM Builder e outros sistemas
- facil comunicacao com clientes
