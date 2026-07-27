# Gestao de Clientes

## Escopo

Clientes representam os donos dos relatorios publicados no portal.

Exemplo inicial:

- Porvir

## Cadastro

Campos:

- nome
- logo por URL ou upload de imagem
- descricao
- status

Regras:

- nome e obrigatorio
- slug e gerado automaticamente a partir do nome
- logo pode ser enviada pelo formulario ou informada como `https://`, caminho local iniciado por `/` ou data URL de imagem
- cliente novo nasce ativo por padrao
- criacao gera auditoria `client_created`

## Edicao

Usuarios `admin` e `editor` podem editar:

- nome
- logo
- descricao
- status
- usuarios com acesso

Somente `admin` pode alterar usuarios com acesso. `editor` edita apenas os dados do cliente atribuido.

Atualizacoes geram auditoria:

- `client_updated`
- `client_users_updated`

## Status

Status disponiveis:

- `active`
- `inactive`
- `archived`

Clientes arquivados preservam historico e podem ser ocultos por padrao em telas futuras.

## Usuarios com acesso

Na tela de clientes, administradores podem marcar usuarios que devem acessar o cliente.

Essa atribuicao alimenta a tabela:

```txt
user_clients
```

Viewers consultam apenas clientes vinculados.

## Arquivamento e exclusao

Ao remover um cliente:

- se o cliente possui relatorios, o sistema arquiva
- se o cliente nao possui relatorios, o sistema exclui

Essa regra evita apagar historico publicado por acidente.

## API

Endpoints principais:

- `GET /api/clients`
- `POST /api/clients`
- `PATCH /api/clients/:id`
- `DELETE /api/clients/:id`
- `GET /api/clients/:id/users`
- `PUT /api/clients/:id/users`
