# Fluxos de Usuario

## Primeiro acesso

1. Sistema identifica que nao existe admin.
2. Exibe tela de setup.
3. Usuario cria administrador inicial.
4. Sistema redireciona para login ou entra direto.

## Login

1. Usuario informa email e senha.
2. Sistema valida credenciais.
3. Se houver apenas um cliente vinculado, abre dashboard desse cliente.
4. Se houver varios clientes, abre selecao de cliente ou dashboard geral.

## Viewer consultando relatorios

1. Usuario entra no painel do cliente.
2. Visualiza logo, nome do cliente e resumo.
3. Filtra por periodo.
4. Abre relatorio.
5. Clica em um dos links externos.

## Editor publicando relatorio

1. Editor acessa Relatorios.
2. Clica em novo relatorio.
3. Seleciona cliente.
4. Define tipo de periodo.
5. Preenche datas e titulo.
6. Adiciona um ou varios links.
7. Salva como rascunho ou publica.

## Admin cadastrando cliente

1. Admin acessa Clientes.
2. Clica em novo cliente.
3. Preenche nome, logo e descricao.
4. Salva cliente ativo.
5. Vincula usuarios.

## Admin cadastrando usuario

1. Admin acessa Usuarios.
2. Clica em novo usuario.
3. Define nome, email, senha inicial e role.
4. Seleciona clientes permitidos.
5. Salva.

## Edicao

Todos os cadastros principais devem ter acao de editar:

- usuario
- cliente
- relatorio
- link
- permissao
- branding

## Exclusao e arquivamento

Quando a acao impactar historico, o sistema deve sugerir arquivar/inativar.

Exclusao definitiva deve:

- pedir confirmacao
- explicar impacto
- registrar auditoria

## Estados vazios

Exemplos:

- cliente sem relatorios
- relatorio sem links
- usuario sem clientes
- busca sem resultados

Estados vazios devem oferecer acao direta quando usuario tiver permissao.
