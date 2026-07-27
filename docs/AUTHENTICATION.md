# Autenticacao

## Setup inicial

Quando a tabela `users` esta vazia, o sistema exige setup inicial.

O setup:

- valida nome, email e senha
- exige senha com pelo menos 8 caracteres
- cria o primeiro usuario com role `admin`
- cria uma sessao automaticamente
- redireciona o usuario para o app autenticado
- registra auditoria `setup_admin_created`

## Login

O login exige:

- email valido
- senha preenchida
- usuario ativo

Eventos auditados:

- `login_success`
- `login_failed`
- `login_inactive_user`

## Sessao

As sessoes ficam na tabela `sessions`.

Variavel:

```txt
SESSION_TTL_HOURS=24
```

Se nao for definida ou for invalida, o sistema usa 24 horas.

## Logout

O logout remove o token da tabela `sessions` e limpa o token do navegador.

## Frontend

O token fica em `localStorage` com a chave:

```txt
porvir_reports_hub_token
```

Erros de setup/login aparecem na propria tela de autenticacao.
