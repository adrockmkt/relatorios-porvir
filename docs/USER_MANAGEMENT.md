# Gestao de Usuarios

## Escopo

A area de usuarios e restrita a administradores.

## Cadastro

Campos:

- nome
- email
- senha inicial
- perfil: `admin`, `editor`, `viewer`

Regras:

- email deve ser valido e unico
- senha deve ter pelo menos 8 caracteres
- usuario novo nasce ativo
- criacao gera auditoria `user_created`

## Edicao

Administradores podem editar:

- nome
- email
- perfil
- status
- clientes atribuidos

Atualizacoes geram auditoria `user_updated` e `user_clients_updated`.

## Status

Status disponiveis:

- `active`
- `inactive`

Usuario inativo nao consegue fazer login.

## Clientes atribuidos

Usuarios podem ser vinculados a um ou varios clientes.

Viewers veem apenas clientes atribuidos.

## Troca de senha

Administradores podem redefinir senha de usuarios.

Regras:

- minimo de 8 caracteres
- auditoria `user_password_reset`

## Exclusao

Administradores podem excluir usuarios, exceto a propria conta logada.

Preferencia operacional:

- inativar quando o usuario deve perder acesso sem apagar historico
- excluir quando o cadastro foi erro ou duplicado

Exclusao gera auditoria `user_deleted`.
