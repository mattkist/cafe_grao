# Especificações de Páginas - CAFÉ GRÃO

Este documento detalha cada página/tela do sistema, seus componentes, comportamentos e regras de negócio.

---

## 🏠 Página Inicial (Landing) - `/`

### Acesso
- **Aberta**: Usuários não autenticados
- **Protegida**: Não (é o fallback para não logados)

### Layout e Elementos

```
┌─────────────────────────────────────┐
│                                     │
│          CAFÉ GRÃO                  │
│                                     │
│  Controle Automático de            │
│  Fornecimento, Estoque e            │
│  Gerenciamento de Registro e        │
│  Abastecimento Operacional          │
│                                     │
│  [C O N T R O L E] [A U T O M Á T I│
│  [F O R N E C I M E N T O] ...     │
│  (letras coloridas mostrando        │
│   o acrônimo)                        │
│                                     │
│  [Entrar com Google]                │
│                                     │
└─────────────────────────────────────┘
```

### Elementos Visuais
- **Nome grande**: "CAFÉ GRÃO" - Tipografia destacada
- **Subtítulo**: Texto completo do acrônimo com letras coloridas para destacar "C A F É G R Ã O"
- **Botão de login**: Centralizado, destaque visual

### Comportamento
- Ao clicar "Entrar com Google", abre popup de autenticação
- Após login, redireciona conforme:
  - Se `isActive: false` → `/inactive`
  - Se `isActive: true` → `/home`

---

## ⏳ Página Inativo - `/inactive`

### Acesso
- **Apenas logados** com `isActive: false`
- **Redireciona** para `/home` se `isActive: true`

### Layout e Elementos

```
┌─────────────────────────────────────┐
│  [Menu Lateral]                     │
│                                     │
│  ☕ Espera aí, meu chapa!            │
│                                     │
│  Mensagem descontraída e piadista   │
│  sobre café e espera com humor      │
│  sobre a situação de aguardar       │
│  ativação...                        │
│                                     │
│  [Botão Sair]                       │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ Administradores:             │   │
│  │                               │   │
│  │ [Foto] João Silva             │   │
│  │        joao@example.com       │   │
│  │                               │   │
│  │ [Foto] Maria Santos           │   │
│  │        maria@example.com     │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

### Elementos Visuais
- **Título**: "☕ Espera aí, meu chapa!" - Tom descontraído
- **Mensagem**: Texto piadista sobre café e espera, com piadas sobre:
  - Esperar como esperar para fazer café sem grãos
  - "A melhor forma de esperar é... esperando com um cafezinho na mão!"
  - Administradores como "baristas chefes"
- **Botão Sair**: Permite logout e retorno à página inicial

### Comportamento
- Exibe mensagem com tema cômico de café e piadas sobre espera
- Lista todos os usuários com `isAdmin: true`
- Card para cada admin mostra:
  - Foto (ou placeholder)
  - Nome
  - Email
- Card com estilo bonito e destaque visual
- **Botão Sair**: Faz logout e redireciona para `/`

### Regras
- Permite logout via botão "Sair"
- Usuário deve aguardar ativação por admin
- Após logout, pode fazer login novamente (mas continua inativo até ser ativado)

---

## 📊 Home/Landing (Logado) - `/home`

### Acesso
- **Apenas logados** com `isActive: true`
- **Redireciona** não autenticados para `/`
- **Redireciona** `isActive: false` para `/inactive`

### Layout e Elementos

#### Header

```
┌─────────────────────────────────────────────────────┐
│  CAFÉ GRÃO                    [Foto] João Silva   │
│  Controle Automático de Fornecimento, Estoque...   │
│  Total Contribuições: R$ 250,00                    │
│  Total KGs: 5.5 kg                                  │
│                                                     │
│  [+ Nova Contribuição | Votação | Novo Produto] [Sair] │
└─────────────────────────────────────────────────────┘
```

**Elementos do Header**:
- **Nome do sistema**: "CAFÉ GRÃO" (esquerda)
- **Slogan**: "Controle Automático de Fornecimento, Estoque e Gerenciamento de Registro e Abastecimento Operacional" (logo abaixo do título, em itálico e tamanho menor)
- **Foto do usuário**: Circular, clicável (vai para Settings)
- **Nome do usuário**: Ao lado da foto
- **Total de Contribuições**: Valor total já contribuído pelo usuário
- **Total de KGs**: Quantidade total de café registrada pelo usuário
- **Botão + (ADD)**: Expande para três opções:
  - Nova Contribuição (abre modal)
  - Votação (vai para `/votes`)
  - Novo Produto (abre modal)
- **Botão Sair**: Faz logout

**Interações**:
- Clicar na foto/nome → `/settings`
- Clicar "Nova Contribuição" → Abre modal
- Clicar "Votação" → `/votes`
- Clicar "Novo Produto" → Abre modal
- Clicar "Sair" → Faz logout e redireciona para `/`

#### Avisos (Alerts)

**Posição**: Logo abaixo do header

**Avisos Possíveis**:

1. **"Já chegou o café?!"**
   - **Condição**: Usuário possui contribuição(ões) com `arrivalEvidence: null` ou `arrivalDate: null`
   - **Exibição**: Card destacado
   - **Ação**: Botão "Editar Contribuição" que abre modal de edição dessa contribuição

2. **"Não esqueça de dar o seu voto!"**
   - **Condição**: Existe produto sem voto do usuário atual
   - **Exibição**: Card destacado
   - **Ação**: Botão que redireciona para `/votes`

3. **"Menor contribuição dos últimos X meses detectada!"**
   - **Condição**: Usuário está em última posição (ou dividindo última) no ranking de KGs dos últimos X meses (onde X = `calculationBaseMonths` da configuração)
   - **Exibição**: Card destacado (pode ser cômico/divertido)
   - **Nota**: X é configurável por admins em Settings

**Regras dos Avisos**:
- Aparecem apenas se as condições forem verdadeiras
- Múltiplos avisos podem aparecer simultaneamente
- Ordem de prioridade: 1. Chegada do café, 2. Voto pendente, 3. Menor contribuição

#### Dashboard

**1. Lista de Colaboradores (Corrida de Barras)**

- **Formato**: Gráfico de barras horizontal (ECharts)
- **Dados**: Nome e total de KGs dos últimos X meses (baseado em `calculationBaseMonths`)
- **Base de cálculo**: Apenas contribuições dentro de `calculationBaseMonths` meses
- **Visual**: Barras horizontais com gradiente de marrom/café (tema do sistema)
- **Ordenação**: Do maior para o menor contribuidor
- **Tooltip**: Mostra nome e quantidade em kg ao passar o mouse
- **Interatividade**: Hover mostra detalhes, labels mostram valores

**2. Indicadores de Cafeína**

```
┌─────────────────────────────────────┐
│  Indicadores                        │
│                                     │
│  ┌───────────────────────────────┐ │
│  │ Valor Total Investido          │ │
│  │ R$ 1.250,00                   │ │
│  └───────────────────────────────┘ │
│                                     │
│  ┌───────────────────────────────┐ │
│  │ KGs Total Consumido            │ │
│  │ 45.5 kg                        │ │
│  └───────────────────────────────┘ │
│                                     │
│  ┌───────────────────────────────┐ │
│  │ Média Consumo Mensal           │ │
│  │ 7.6 kg                         │ │
│  └───────────────────────────────┘ │
│                                     │
│  ┌───────────────────────────────┐ │
│  │ Média Investimento Mensal      │ │
│  │ R$ 208,00                      │ │
│  └───────────────────────────────┘ │
│                                     │
│  ┌───────────────────────────────┐ │
│  │ Média Custo por Colaborador    │ │
│  │ R$ 416,00                      │ │
│  └───────────────────────────────┘ │
└─────────────────────────────────────┘
```

- **Métricas** (exibidas em cards):
  - Valor total investido (soma de todas as contribuições)
  - KGs total consumido (soma de todas as quantidades)
  - Média de consumo mensal (média de KGs por mês com registro)
  - Média de investimento mensal (média de valores por mês com registro)
  - Média custo por colaborador (total investido / número de colaboradores ativos)

**3. Linha do Tempo**

- **Gráfico de barras** (ECharts)
- **Eixo X**: Meses
- **Eixo Y**: Quantidade de KGs
- **Barras**: Cada cor representa um usuário, com imagem do usuário na barra
- **Tooltip**: Mostra usuário, quantidade de KGs naquele mês
- **Interatividade**: Zoom, hover com detalhes

---

## ⚙️ Settings - `/settings`

### Acesso
- **Apenas logados** com `isActive: true`

### Layout e Elementos

```
┌─────────────────────────────────────┐
│  [Menu Lateral]                     │
│                                     │
│  Settings                           │
│                                     │
│  Seus Dados:                        │
│  - Nome: João Silva                 │
│  - Email: joao@example.com          │
│  - Foto: [Atualizar]                │
│                                     │
│  (Se ADMIN)                         │
│  ┌─────────────────────────────┐   │
│  │ Configurações do Sistema    │   │
│  │                              │   │
│  │ Quantidade de Meses para     │   │
│  │ Base de Cálculo: [6] meses  │   │
│  │                              │   │
│  │ [Salvar]                    │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

### Elementos
- **Dados do usuário**: Edição de informações básicas (nome, foto)
- **Se Admin**: Seção adicional com configurações do sistema
  - Editar `calculationBaseMonths`
  - Lista todas as configurações disponíveis

### Comportamento
- Salvar alterações atualiza Firestore
- Validações apropriadas

---

## 📝 Modal: Nova Contribuição

### Acesso
- Abre de `/home` ao clicar "Nova Contribuição"
- Abre de `/contributions` ao clicar "Nova Contribuição"

### Layout e Elementos

```
┌─────────────────────────────────────┐
│  Nova Contribuição          [X]     │
│                                     │
│  Pessoa (apenas se ADMIN):          │
│  ┌─────────────────────────────┐   │
│  │ [Foto] João Silva           │   │
│  │ [Foto] Maria Santos         │   │
│  │ [Foto] Pedro Costa          │   │
│  └─────────────────────────────┘   │
│                                     │
│  Data Compra: [DD/MM/AAAA] *        │
│  Valor (R$): [______] *             │
│  Quantidade (KG): [______] *        │
│                                     │
│  Café/Produto: [____] *             │
│  (Busca com filtro em tempo real)   │
│                                     │
│  Evidência Compra: [Upload] *       │
│  Evidência Chegada: [Upload]        │
│  Data Chegada: [DD/MM/AAAA]         │
│                                     │
│  [Cancelar] [Salvar]               │
└─────────────────────────────────────┘
```

### Campos

1. **Pessoa** (apenas se ADMIN)
   - **Componente especial**: Cards selecionáveis com foto e nome
   - Se não ADMIN: Campo oculto com ID do usuário atual

2. **Data Compra** *
   - Datepicker moderno
   - Formato DD/MM/AAAA
   - Obrigatório

3. **Valor (R$)** *
   - Input numérico
   - Formato monetário brasileiro
   - Obrigatório

4. **Quantidade (KG)** *
   - Input numérico
   - Permitir decimais
   - Obrigatório

5. **Café/Produto** *
   - **Componente especial**: Busca com filtro em tempo real
   - Ao digitar, filtra produtos existentes
   - Pode selecionar produto existente OU digitar nome novo
   - Se digitar nome novo (sem selecionar): cria produto automaticamente ao salvar

6. **Evidência Compra** *
   - Campo de texto para colar link do Google Drive OU
   - Upload de arquivo (upload automático ainda não configurado)
   - Preview da imagem selecionada ou confirmação do link
   - Obrigatório: ou link do Google Drive ou arquivo

7. **Evidência Chegada**
   - Campo de texto para colar link do Google Drive OU
   - Upload de arquivo (upload automático ainda não configurado)
   - Preview da imagem selecionada ou confirmação do link
   - Opcional

8. **Data Chegada**
   - Datepicker
   - Opcional

### Regras de Negócio

- **Ao salvar**:
  - Se produto novo foi digitado: Cria produto com:
    - `name`: Nome digitado
    - `description`: null
    - `photoURL`: null
    - `averagePricePerKg`: valor / quantidadeKg
    - `averageRating`: 0
  - Se produto existente: Atualiza `averagePricePerKg` do produto:
    - Recalcula: soma todos os valores / soma todos os KGs
  - Cria documento em `contributions`
  - Processamento de imagens: converte link do Google Drive para URL de imagem direta, ou permite upload manual

- **Validações**:
  - Campos obrigatórios (*)
  - Data compra não pode ser futura
  - Data chegada não pode ser anterior à data compra
  - Valor e quantidade devem ser > 0

---

## 🆕 Modal: Novo Produto

### Acesso
- Abre de `/home` ao clicar "Novo Produto"
- Abre de `/products` ao clicar "Novo Produto"

### Layout e Elementos

```
┌─────────────────────────────────────┐
│  Novo Produto               [X]     │
│                                     │
│  Nome: [________________] *         │
│                                     │
│  Descrição:                         │
│  [________________]                 │
│  [________________]                 │
│                                     │
│  Foto: [Upload]                     │
│  [Preview da imagem]                │
│                                     │
│  [Cancelar] [Salvar]               │
└─────────────────────────────────────┘
```

### Campos

1. **Nome** *
   - Input texto
   - Obrigatório

2. **Descrição**
   - Textarea
   - Opcional

3. **Foto**
   - Upload de imagem
   - Preview
   - Opcional (mas recomendado)

### Regras de Negócio

- Ao salvar: Cria documento em `products`
- `averagePricePerKg`: 0 (atualizado quando houver contribuições)
- `averageRating`: 0

---

## ⭐ Votação - `/votes`

### Acesso
- **Apenas logados** com `isActive: true`

### Layout e Elementos

```
┌─────────────────────────────────────┐
│  [Menu Lateral]                     │
│                                     │
│  Votações                           │
│                                     │
│  [Filtrar] [Ordenar]               │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ Café Expresso               │   │
│  │ ⭐⭐⭐⭐⭐ (clique para votar)│   │
│  │ Média: 4.5 ⭐               │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ Café Gourmet (sem voto)     │   │
│  │ ⭐⭐⭐⭐⭐ (highlight - não votou)│ │
│  │ Média: 3.0 ⭐               │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

### Elementos

- **Lista de produtos**: Cards com foto, nome, média de rating
- **Sistema de estrelas**: 5 estrelas clicáveis (0-5, permitindo meia estrela)
- **Média exibida**: Média geral do produto
- **Highlight**: Produtos não votados pelo usuário destacados visualmente
- **Filtros**: Filtrar por nome, rating, etc.
- **Ordenação**: Ordenar por nome, média, etc.

### Comportamento

- Ao clicar nas estrelas: Atualiza ou cria voto
- Recalcula `averageRating` do produto automaticamente
- Visualização em tempo real da média atualizada

### Regras

- Cada usuário vota apenas uma vez por produto
- Se já votou, atualiza o voto existente
- Arredondamento: Média sempre em meia estrela (0, 0.5, 1, ..., 5)

---

## 📦 Contribuições - `/contributions`

### Acesso
- **Apenas logados** com `isActive: true`

### Layout e Elementos

```
┌─────────────────────────────────────┐
│  [Menu Lateral]                     │
│                                     │
│  Contribuições                      │
│                                     │
│  [Nova Contribuição] [Filtrar]     │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ João Silva - 15/12/2024      │   │
│  │ Café Expresso - 5.0 kg       │   │
│  │ R$ 250,00                    │   │
│  │ [Evidências] [Editar]        │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

### Funcionalidades

- **CRUD completo**:
  - Criar (via modal)
  - Ler (listar todas)
  - Atualizar (editar contribuições via modal de edição)
  - Deletar (apenas próprias ou se admin)

- **Informações exibidas nos cards**:
  - Foto e nome do usuário
  - Data da compra
  - Nome do produto
  - Preço médio por kg do produto
  - Avaliação em estrelas do produto
  - Quantidade comprada (kg)
  - Valor total da compra

- **Filtros**: Por usuário, produto, data, etc.
- **Ordenação**: Por data, valor, quantidade, etc.

### Edição

- Ao editar e adicionar `arrivalEvidence` e `arrivalDate`:
  - Se produto não tem `photoURL`, usa `arrivalEvidence` como foto do produto

---

## 🏷️ Produtos - `/products`

### Acesso
- **Apenas logados** com `isActive: true`

### Layout e Elementos

```
┌─────────────────────────────────────┐
│  [Menu Lateral]                     │
│                                     │
│  Produtos                           │
│                                     │
│  [Novo Produto] [Filtrar]          │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ [Foto] Café Expresso        │   │
│  │ Média: R$ 50,00/kg          │   │
│  │ Rating: 4.5 ⭐              │   │
│  │ [Editar]                    │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

### Funcionalidades

- **CRUD completo**:
  - Criar (via modal)
  - Ler (listar todos)
  - Atualizar (editar produtos)
  - Deletar (quando não houver contribuições vinculadas)

- **Filtros**: Por nome, rating, preço médio
- **Ordenação**: Por nome, rating, preço médio

---

## 📋 Menu Lateral

### Estados

- **Collapsed**: Apenas ícones visíveis
- **Expanded**: Ícones + textos

### Botões

1. **Home** → `/home`
2. **Contribuições** → `/contributions`
3. **Votações** → `/votes`
4. **Produtos** → `/products`
5. **Settings** → `/settings`
6. **Usuários** → `/users` (apenas para administradores)

### Comportamento

- Clicar no menu ou botão toggle expande/colapsa
- Transição suave
- Persiste estado (opcional: localStorage)
- Itens marcados como `adminOnly` só aparecem para usuários com `isAdmin: true`

---

## 🦶 Footer

### Elementos

O footer aparece fixo na parte inferior de todas as páginas que usam o componente `Layout`.

**Elementos do Footer**:
- **Nome e slogan**: "☕ CAFÉ GRÃO - Controle Automático de Fornecimento, Estoque e Gerenciamento de Registro e Abastecimento Operacional"
- **Créditos**: "Feito com ❤️ e muito ☕ | [Ano atual]"

### Características

- **Posição**: Fixo na parte inferior (`position: fixed`)
- **Largura**: Do menu lateral até a borda direita da tela
- **Background**: Cor marrom translúcida (`rgba(139, 69, 19, 0.95)`)
- **Texto**: Branco com opacidade variável
- **Espaçamento**: Padding adequado para não sobrepor conteúdo
- **Z-index**: 100 (fica acima do conteúdo mas abaixo de modais)

### Layout

- **Estrutura**: Flexbox com espaçamento entre elementos
- **Responsivo**: Quebra em telas menores (`flexWrap: wrap`)
- **Padding do conteúdo**: O `main` tem `paddingBottom: 80px` para evitar sobreposição com o footer

---

## 👥 Usuários - `/users`

### Acesso
- **Apenas administradores** (`isAdmin: true` e `isActive: true`)
- **Redireciona** usuários não-admin para `/home`

### Layout e Elementos

```
┌─────────────────────────────────────┐
│  [Menu Lateral]                     │
│                                     │
│  Usuários                           │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ [Foto] João Silva            │   │
│  │ joao@example.com             │   │
│  │                              │   │
│  │ ☑ Administrador              │   │
│  │ ☑ Ativo                       │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ [Foto] Maria Santos          │   │
│  │ maria@example.com            │   │
│  │                              │   │
│  │ ☐ Administrador              │   │
│  │ ☑ Ativo                       │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

### Funcionalidades

- **Listar todos os usuários**: Exibe todos os usuários do sistema
- **Editar flags dos usuários**:
  - **isAdmin**: Checkbox para tornar usuário administrador ou não
  - **isActive**: Checkbox para ativar/desativar usuário
- **Visualização**:
  - Foto do usuário (ou placeholder)
  - Nome do usuário
  - Email do usuário
  - Status visual diferenciado por cores

### Comportamento

- Ao alterar checkbox: Atualiza imediatamente no Firestore
- Feedback visual após salvar
- Carregamento de todos os usuários ao abrir a página

### Regras

- Apenas administradores podem acessar esta página
- Administradores podem editar qualquer flag de qualquer usuário
- Mudanças são salvas imediatamente no Firestore

---

**Última atualização**: Dezembro 2024

