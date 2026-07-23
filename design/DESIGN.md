# Ad Rock Console UI

Design system operacional para ferramentas internas, portais de cliente e dashboards da Ad Rock.

## Origem

Este design system reaproveita o estilo visual do projeto `utm_builder`.

## Tokens

### Cores

- `adrock-black`: `#050505`
- `adrock-orange`: `#ff940e`
- `adrock-red`: `#ff0e03`
- `adrock-sky`: `#c1d6e9`
- `adrock-cream`: `#fffdf8`
- `adrock-ink`: `#171717`
- `adrock-muted`: `#5f6773`

### Fundos

Usar base clara:

- pagina: gradiente sutil de `#fffdf8` para `#f3f4f6`
- superficies: branco com transparencia leve
- bordas: `rgba(193, 214, 233, 0.9)`

### Tipografia

- familia: Inter, system-ui, sans-serif
- titulos: peso 700
- labels: peso 600
- corpo: peso 400 ou 500
- letter-spacing: 0

### Bordas e raio

- cards e paineis: 8px a 16px conforme densidade
- inputs: 12px a 16px
- botoes: 10px a 14px

### Sombras

Sombra principal:

`0 24px 70px rgba(193, 214, 233, 0.32)`

Usar com moderacao em paineis principais.

## Componentes

### App Shell

Composto por:

- topo com logo, titulo e slogan
- navegacao lateral ou tabs superiores
- area de conteudo
- identificacao do usuario logado

### Cards de resumo

Usar para:

- total de relatorios
- ultimo relatorio publicado
- clientes ativos
- links cadastrados

### Tabelas

Devem ter:

- busca
- filtros
- coluna de status
- acoes de editar, arquivar e excluir
- estado vazio

### Formularios

Campos sempre com label. Campos obrigatorios marcados visualmente. Erros devem aparecer em texto curto abaixo do campo.

### Badges

Status sugeridos:

- publicado
- rascunho
- arquivado
- ativo
- inativo

### Links de relatorio

Cada link deve mostrar:

- titulo
- tipo de destino
- URL
- observacao opcional
- botao abrir em nova aba
- acoes de editar/excluir para usuarios autorizados

## Branding editavel

Administradores devem conseguir editar:

- logo do topo por URL ou upload futuro
- titulo do sistema
- slogan
- nome publico da instalacao
- logo padrao de cliente quando ausente

## Tom textual

Claro, direto e profissional.

Exemplos:

- `Relatorios publicados`
- `Adicionar link`
- `Editar cliente`
- `Arquivar relatorio`
- `Este usuario acessa apenas os clientes selecionados`
