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

- ver clientes atribuidos
- criar cliente novo
- editar clientes atribuidos
- criar e editar relatorios de clientes atribuidos
- criar e editar links de relatorios de clientes atribuidos
- publicar e arquivar relatorios

Nao pode:

- gerenciar usuarios
- alterar branding global
- atribuir usuarios a clientes
- ver dados de clientes sem permissao

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

Editors podem ver apenas clientes atribuidos. Quando um editor cria um cliente novo, o sistema atribui esse cliente ao editor automaticamente.

Viewers podem ver apenas clientes atribuidos e relatorios publicados.
