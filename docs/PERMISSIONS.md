# Permissoes Usuario-Cliente

## Regra central

O acesso a dados de cliente e sempre mediado por `user_clients`, exceto para administradores.

## Perfis

### admin

Pode:

- ver todos os clientes
- criar, editar, arquivar e excluir clientes
- gerenciar usuarios
- atribuir usuarios a clientes
- ver, criar, editar e arquivar relatorios de qualquer cliente
- criar, editar e excluir links de qualquer relatorio
- alterar branding

### editor

Pode:

- ver apenas clientes atribuidos
- criar cliente novo
- editar e arquivar clientes atribuidos
- criar, editar e arquivar relatorios de clientes atribuidos
- criar, editar e excluir links de relatorios de clientes atribuidos

Ao criar um cliente, o editor e automaticamente vinculado ao cliente criado.

Nao pode:

- gerenciar usuarios
- atribuir usuarios a clientes
- alterar branding global

### viewer

Pode:

- ver apenas clientes atribuidos
- ver apenas relatorios publicados
- abrir links de relatorios publicados

Nao pode:

- criar, editar ou excluir clientes
- criar, editar ou excluir relatorios
- criar, editar ou excluir links
- ver rascunhos

## Backend

As regras compartilhadas ficam em:

```txt
server/src/utils/permissions.js
```

Rotas protegidas:

- clientes: `server/src/routes/clients.js`
- relatorios: `server/src/routes/reports.js`
- links de relatorio: `server/src/routes/reportLinks.js`
- usuarios: `server/src/routes/users.js`

## Observacoes

- Admin e o unico perfil que altera vinculos usuario-cliente diretamente.
- Editor fica restrito aos clientes atribuidos.
- Viewer fica restrito aos clientes atribuidos e aos relatorios publicados.
- A interface segue essas regras, mas o bloqueio principal fica no backend.
