# design.md

# Porvir Reports Hub

## Linguagem visual

O projeto deve usar o design system **Ad Rock Console UI**, derivado do estilo do `utm_builder`.

A interface deve parecer um painel operacional moderno, claro e confiavel: fundo claro, cards brancos, bordas suaves, detalhes em laranja Ad Rock, tipografia legivel e componentes densos o suficiente para uso recorrente.

## Objetivo da experiencia

O usuario entra com login e senha, identifica rapidamente o cliente e encontra os relatorios publicados por periodo.

O admin deve conseguir cadastrar, editar, arquivar, excluir e reorganizar informacoes sem depender de codigo.

## Estrutura de navegacao

### Usuario viewer

- Login
- Dashboard do cliente
- Historico de relatorios
- Detalhe do relatorio
- Links externos

### Usuario editor/admin

- Dashboard
- Clientes
- Relatorios
- Usuarios
- Permissoes
- Configuracoes de marca
- Auditoria

## Topo do sistema

O topo deve ser editavel e conter:

- logo do dono da instalacao, por exemplo Ad Rock ou Porvir
- titulo do sistema
- slogan
- usuario logado
- botao de sair

Exemplo:

- Logo: Ad Rock
- Titulo: Porvir Reports Hub
- Slogan: Historico de relatorios e entregas Ad Rock

## Cliente

Cada cliente deve aparecer com:

- logo
- nome
- descricao curta opcional
- quantidade de relatorios
- ultimo relatorio publicado
- status

## Relatorios

Cada relatorio deve exibir:

- cliente
- titulo
- periodo do relatorio
- tipo: diario, semanal, mensal, trimestral, semestral, anual
- data inicial e final
- status
- observacoes
- um ou varios links

## Componentes principais

- formulario de login
- cabecalho editavel
- filtros por periodo
- cards de resumo
- tabela de relatorios
- lista de links
- modal de cadastro/edicao
- confirmacao de exclusao
- estados vazios
- avisos de erro/sucesso
- badges de status

## Responsividade

Mobile-first, mas com prioridade para desktop e notebook, pois o uso principal sera administrativo e de consulta de relatorios.

No mobile:

- tabelas viram listas compactas
- filtros ficam recolhiveis
- botoes de acao ficam agrupados
- textos longos de links devem quebrar linha ou truncar com tooltip

## Acessibilidade

- contraste adequado
- foco visivel em formularios e botoes
- labels em todos os campos
- botoes com nomes claros
- mensagens de erro proxima ao campo
- navegacao por teclado nas acoes principais

## Anti-patterns

- nao criar landing page publica como tela principal
- nao usar hero de marketing
- nao esconder a lista de relatorios atras de passos desnecessarios
- nao usar componentes puramente decorativos
- nao travar campos que precisam mudar com frequencia
- nao depender de upload de arquivos para relatorios
