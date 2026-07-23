# Seguranca

## Objetivo

Proteger o acesso ao catalogo de relatorios e limitar cada usuario aos clientes permitidos.

## Autenticacao

- senha armazenada com hash forte
- token/sessao com expiracao
- logout remove sessao
- usuarios inativos nao fazem login
- setup inicial cria primeiro admin

## Autorizacao

Roles:

- `admin`: gerencia tudo
- `editor`: gerencia clientes e relatorios conforme regra definida
- `viewer`: consulta apenas clientes atribuidos

Regras:

- viewer nao acessa clientes sem vinculo
- editor/admin podem cadastrar e editar relatorios
- somente admin gerencia usuarios, permissoes e branding global

## Links externos

O portal protege a lista de links, nao necessariamente o destino externo.

Se um relatorio do Looker Studio, Drive ou Sheets estiver publico, qualquer pessoa com o link podera acessar fora do portal. Para confidencialidade real, configurar permissao tambem na ferramenta de origem.

## Auditoria

Registrar:

- login com sucesso
- falha de login
- logout
- criacao/edicao/exclusao de usuarios
- criacao/edicao/exclusao de clientes
- criacao/edicao/exclusao de relatorios
- criacao/edicao/exclusao de links
- mudancas de permissao
- mudancas de branding

## Exclusao

Preferir:

- inativar usuario
- arquivar cliente
- arquivar relatorio

Permitir exclusao definitiva somente quando:

- admin confirma
- nao ha impacto critico ou o sistema registra auditoria

## Producao

- HTTPS obrigatorio
- rate limit em login
- headers de seguranca no Nginx/API
- variaveis sensiveis fora do codigo
- backup diario do banco
- logs de aplicacao
