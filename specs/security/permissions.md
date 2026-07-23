# Permissoes

## Roles

### admin

Pode:

- gerenciar usuarios
- gerenciar clientes
- gerenciar relatorios
- gerenciar links
- alterar branding
- ver auditoria
- alterar permissoes

### editor

Pode:

- criar e editar clientes, se liberado na politica final
- criar e editar relatorios
- criar e editar links
- publicar e arquivar relatorios

Nao pode:

- gerenciar usuarios
- alterar branding global
- ver dados de clientes sem permissao, se a regra assim exigir

### viewer

Pode:

- ver clientes atribuidos
- ver relatorios publicados
- abrir links externos

Nao pode:

- criar, editar ou excluir dados
- ver clientes nao atribuidos
- acessar auditoria

## Politica de acesso a cliente

Toda consulta de relatorio deve validar se o usuario tem permissao sobre o `client_id`.

Admins podem ver todos os clientes.

Editors podem ver todos ou apenas atribuidos, conforme decisao de produto antes da implementacao.
