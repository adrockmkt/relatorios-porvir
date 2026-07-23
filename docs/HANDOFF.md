# Handoff

## Contexto rapido

O Porvir Reports Hub e um portal privado para organizar links de relatorios por cliente e periodo.

Repo informado:

`https://github.com/adrockmkt/relatorios-porvir.git`

Dominio planejado:

`relatorios.porvir.org`

Design system:

`Ad Rock Console UI`, baseado no `utm_builder`.

## Decisoes ja tomadas

- O MVP nao faz upload de arquivos.
- O sistema cadastra links externos.
- Tudo deve ser editavel/cadastravel.
- Clientes, usuarios, relatorios e links precisam de CRUD.
- Exclusao deve ter confirmacao e auditoria.
- Arquivar e inativar sao preferiveis quando houver historico.
- Viewer acessa apenas clientes atribuidos.
- Admin altera branding do topo.

## Referencias locais

- Projeto atual: `/Users/rafaellins/Documents/Projetos Ad Rockers/Ad Rockers/relatorios-porvir`
- Referencia visual/tecnica: `/Users/rafaellins/Documents/Projetos Ad Rockers/Ad Rockers/utm_builder`
- Stack base: `/Users/rafaellins/Documents/Projetos Ad Rockers/Ad Rockers/modelos_de_codigo/AI_PROJECT_STACK.md`

## Primeira tarefa recomendada

Inicializar a base de codigo reaproveitando a arquitetura do `utm_builder`, mas substituindo o dominio de negocio de UTM por clientes, relatorios e links.

## Checklist antes de implementar

- confirmar se a pasta local deve ser conectada ao repo remoto existente
- confirmar se sera copia adaptada do `utm_builder` ou scaffold limpo
- confirmar porta da API em producao
- confirmar se PostgreSQL sera local na Lightsail
- confirmar logo inicial do topo
- confirmar primeiro usuario admin

## Checklist antes de liberar para cliente

- DNS de `relatorios.porvir.org` apontando para Lightsail
- HTTPS ativo
- admin criado
- Porvir cadastrado como cliente
- usuarios do Porvir cadastrados
- links de relatorios iniciais publicados
- backup diario funcionando
- teste de acesso viewer concluido
