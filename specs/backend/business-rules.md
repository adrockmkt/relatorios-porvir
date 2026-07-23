# Regras de Negocio

## Clientes

- cliente deve ter nome obrigatorio
- slug deve ser unico
- logo e descricao sao opcionais
- cliente pode ser ativo, inativo ou arquivado
- cliente com relatorios publicados deve ser arquivado em vez de excluido por padrao

## Usuarios

- email deve ser unico
- senha inicial e obrigatoria no cadastro
- admin pode alterar senha
- usuario inativo nao acessa o sistema
- viewer precisa ter ao menos um cliente atribuido para ver relatorios

## Relatorios

- relatorio pertence a um cliente
- relatorio deve ter titulo
- relatorio deve ter tipo de periodo
- relatorio deve ter data inicial e final quando aplicavel
- relatorio publicado aparece para viewers
- rascunho aparece apenas para editor/admin
- relatorio arquivado fica oculto por padrao, mas pode ser filtrado

## Links

- relatorio pode ter zero ou varios links enquanto rascunho
- para publicar, relatorio deve ter pelo menos um link ativo
- URL deve ser valida
- links podem ser reordenados
- links excluidos devem gerar auditoria

## Branding

- apenas admin altera branding global
- titulo, slogan e logo do topo devem ser editaveis
- logo pode ser URL no MVP
- upload de logo pode entrar em fase posterior
