# CAFÉ GRÃO - Documentação Principal

> **Controle Automático de Fornecimento, Estoque Gerenciamento de Registro e Abastecimento Operacional**

## 📋 Índice

1. [Visão Geral do Sistema](#visão-geral-do-sistema)
2. [Instruções Básicas de Desenvolvimento](#instruções-básicas-de-desenvolvimento)
3. [Estrutura da Documentação](#estrutura-da-documentação)
4. [Tecnologias Utilizadas](#tecnologias-utilizadas)
5. [Estrutura do Projeto](#estrutura-do-projeto)

---

## 🎯 Visão Geral do Sistema

O **CAFÉ GRÃO** é um sistema colaborativo desenvolvido de forma descontraída para gerenciar o compartilhamento de café em grão entre membros de uma equipe de trabalho.

### Objetivo

Registrar de forma organizada e divertida:
- **Membros da equipe** que participam do compartilhamento de café
- **Contribuições** (cafés comprados) de cada membro
- **Valores** gastos em cada compra
- **Evidências** (fotos/comprovantes) das compras
- **Acompanhamento visual** através de gráficos (charts) para:
  - Saber de quem deve ser cobrado o próximo café
  - Identificar quando o estoque está acabando
  - Visualizar histórico de contribuições

### Características Principais

- **Sistema colaborativo**: Todos os usuários autenticados veem os mesmos dados compartilhados
- **Autenticação via Google (Gmail)**: Login simples e seguro
- **Armazenamento online**: Dados persistentes no Firebase
- **Interface moderna**: Desenvolvida com React
- **Deploy gratuito**: Hospedado no GitHub Pages

### Conceito

Um sistema simples, prático e divertido que resolve o problema de "de quem é a vez de comprar café?" de forma clara e visual, mantendo um registro histórico de todas as contribuições.

---

## ⚙️ Instruções Básicas de Desenvolvimento

### Regras Obrigatórias

1. **🚫 SEM TypeScript**: O projeto deve ser desenvolvido **APENAS em JavaScript puro** (`.js` e `.jsx`)
   - Não usar `.ts` ou `.tsx`
   - Não adicionar tipagens TypeScript
   - Não instalar dependências TypeScript

2. **📁 Estrutura de Pastas**: Manter organização clara
   - `src/` - Código fonte
   - `src/components/` - Componentes React
   - `src/hooks/` - Custom hooks
   - `src/services/` - Serviços (Firebase, API, etc.)
   - `src/lib/` - Configurações e utilitários
   - `docs/` - Documentação

3. **🔧 Tecnologias**: Manter stack atual (React + Vite + React Router + Firebase + ECharts)
   - Não adicionar bibliotecas desnecessárias
   - Priorizar soluções nativas quando possível

4. **🎨 Estilo**: Por enquanto inline styles (podemos mudar depois)
   - Manter consistência visual
   - Interface limpa e responsiva

5. **📝 Commits**: Sempre fazer commits descritivos
   - Usuário tem controle total sobre commits
   - Não fazer commits automáticos

6. **🧪 Testes**: Testar localmente antes de deploy
   - Sempre validar funcionamento local
   - Deploy apenas quando tudo estiver funcionando

### Convenções de Código

- **🌐 Idioma do Código**: Todo código, variáveis, nomes de funções, estruturas de banco de dados e propriedades devem estar em **INGLÊS**
  - Variáveis: `userName`, `isAdmin`, `contributionDate`
  - Funções: `getUserProfile()`, `createContribution()`
  - Collections do Firestore: `users`, `contributions`, `products`
  - Propriedades de objetos: `userId`, `purchaseDate`, `quantityKg`
  - Apenas strings de exibição (mensagens ao usuário) podem estar em português
- Usar **ES6+** (arrow functions, destructuring, async/await)
- Nomes de arquivos em **camelCase** para componentes (`LoginButton.jsx`)
- Nomes de arquivos em **camelCase** para hooks (`useAuth.js`)
- Componentes React sempre começam com **letra maiúscula**
- Funções utilitárias em **camelCase**

---

## 📚 Estrutura da Documentação

A documentação está organizada da seguinte forma:

```
docs/
├── main.md                    # Este arquivo (documento principal)
├── tecnologias.md            # Tecnologias utilizadas e seus propósitos
├── arquitetura.md            # Arquitetura do sistema e decisões técnicas
├── database.md               # Estrutura completa do banco de dados
├── design-style.md           # Diretrizes de design e estilo visual
├── especificacoes/           # Especificações de telas e funcionalidades
│   ├── README.md             # Índice das especificações
│   └── pages.md              # Especificações detalhadas de todas as páginas
├── api.md                     # Documentação de serviços/APIs (quando necessário)
└── deploy.md                  # Instruções de deploy e GitHub Pages
```

### Documentos Disponíveis

- **[main.md](./main.md)** - Documento principal (este arquivo)
- **[tecnologias.md](./tecnologias.md)** - Tecnologias e suas funções no projeto
- **[arquitetura.md](./arquitetura.md)** - Arquitetura e decisões técnicas
- **[database.md](./database.md)** - Estrutura completa do banco de dados Firestore
- **[design-style.md](./design-style.md)** - Diretrizes de design e estilo visual
- **[especificacoes/pages.md](./especificacoes/pages.md)** - Especificações detalhadas de todas as páginas

### Documentos a Criar (Futuro)

- `especificacoes/` - Especificações detalhadas de cada tela/funcionalidade
- `api.md` - Documentação de endpoints e serviços Firebase
- `deploy.md` - Guia completo de deploy

---

## 🛠️ Tecnologias Utilizadas

Para detalhes completos sobre cada tecnologia, consulte: **[tecnologias.md](./tecnologias.md)**

### Stack Principal

- **React** - Biblioteca JavaScript para interfaces
- **Vite** - Build tool e dev server
- **React Router** - Roteamento client-side (múltiplas páginas)
- **Firebase** - Backend como serviço (autenticação e banco de dados)
- **Apache ECharts** - Biblioteca de gráficos e visualizações

### Principais Motivos

- **React + Vite**: Desenvolvimento rápido, hot reload, e build otimizado
- **React Router**: Navegação entre múltiplas páginas na SPA
- **Firebase**: Solução completa sem necessidade de backend próprio, gratuito para projetos pequenos
- **Apache ECharts**: Gráficos profissionais e interativos para visualização de dados
- **GitHub Pages**: Deploy gratuito e automático de apps estáticos

---

## 📁 Estrutura do Projeto

```
coffee-collab/
├── src/
│   ├── components/          # Componentes React reutilizáveis
│   │   └── LoginButton.jsx
│   ├── pages/               # Páginas/rotas da aplicação
│   │   ├── Home.jsx
│   │   ├── Dashboard.jsx
│   │   └── Charts.jsx
│   ├── hooks/               # Custom hooks
│   │   └── useAuth.js
│   ├── services/            # Serviços (Firebase, etc.)
│   │   ├── userService.js
│   │   └── contributionService.js
│   ├── lib/                 # Configurações e utilitários
│   │   └── firebase.js
│   ├── App.jsx              # Componente principal (rotas)
│   └── main.jsx             # Entry point
├── docs/                    # Documentação do projeto
├── public/                  # Arquivos estáticos
├── index.html               # HTML principal
├── vite.config.js           # Configuração do Vite
├── package.json             # Dependências do projeto
└── README.md                # README do projeto
```

---

## 🚀 Como Usar Esta Documentação

### Para Novos Desenvolvedores (ou novos contextos de chat)

1. **Leia este documento primeiro** (`main.md`) para entender o sistema
2. **Consulte `tecnologias.md`** para entender a stack técnica
3. **Veja `arquitetura.md`** para decisões de design e arquitetura
4. **Acesse `especificacoes/`** quando começar a implementar funcionalidades específicas

### Para Desenvolvimento

- Sempre seguir as [Instruções Básicas](#instruções-básicas-de-desenvolvimento)
- Consultar especificações antes de implementar novas funcionalidades
- Atualizar documentação quando necessário

---

## 📝 Notas Importantes

- As **telas atuais são temporárias** e serão refeitas
- As **especificações de funcionalidades** serão criadas posteriormente
- O sistema está em **fase inicial de desenvolvimento**
- O foco atual é ter uma **base sólida e documentada** para desenvolvimento futuro

---

**Última atualização**: Dezembro 2024  
**Versão do sistema**: 0.1.0 (Desenvolvimento inicial)

