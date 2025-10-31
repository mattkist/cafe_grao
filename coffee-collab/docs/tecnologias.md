# Tecnologias Utilizadas - CAFÉ GRÃO

Este documento descreve todas as tecnologias, bibliotecas e ferramentas utilizadas no projeto **CAFÉ GRÃO**, explicando o propósito de cada uma e por que foram escolhidas.

---

## 🎨 Frontend

### React

**O que é**: Biblioteca JavaScript para construção de interfaces de usuário baseada em componentes.

**Por que usamos**:
- Componentização reutilizável
- Ecossistema maduro e grande comunidade
- Virtual DOM para performance
- Estado reativo com hooks
- Ideal para SPAs (Single Page Applications)

**Como usamos**:
- Componentes funcionais com hooks (`useState`, `useEffect`)
- Componentização de UI (botões, formulários, listas)
- Gerenciamento de estado local e contexto quando necessário

---

### Vite

**O que é**: Build tool e dev server extremamente rápido para projetos frontend modernos.

**Por que usamos**:
- Dev server ultra-rápido (ESM nativo)
- Hot Module Replacement (HMR) instantâneo
- Build otimizado para produção
- Configuração simples e minimalista
- Melhor que Create React App em velocidade

**Como usamos**:
- Dev server local para desenvolvimento
- Build para produção (GitHub Pages)
- Configuração de base path para GitHub Pages
- Plugins React para suporte JSX

---

## 🔥 Backend/BaaS (Backend as a Service)

### Firebase

**O que é**: Plataforma completa de backend da Google que oferece vários serviços (Auth, Database, Storage, etc.) sem necessidade de servidor próprio.

**Por que usamos**:
- **Gratuito** para projetos pequenos/médios (limites generosos)
- **Sem servidor**: tudo roda do lado do cliente (ideal para GitHub Pages)
- **Autenticação integrada**: Google Auth pronto para usar
- **Firestore**: banco NoSQL em tempo real
- **Escalável**: cresce conforme o projeto cresce

#### Firebase Authentication

**O que faz**: Gerencia autenticação de usuários.

**Como usamos**:
- Login com Google (Gmail)
- Identificação de usuários
- Gerenciamento de sessão
- Sem necessidade de backend próprio

#### Firebase Firestore

**O que faz**: Banco de dados NoSQL em tempo real na nuvem.

**Como usamos**:
- Armazenar perfis de usuários (`users` collection)
- Armazenar contribuições compartilhadas (`contributions` collection)
- Queries e ordenação de dados
- Regras de segurança para controle de acesso

**Configuração**:
- Todas as configurações do Firebase são carregadas via variáveis de ambiente
- Variáveis necessárias: `VITE_FIREBASE_*` (7 variáveis no total)
- Veja `FIREBASE_SETUP.md` para instruções detalhadas

#### Google Drive (Armazenamento de Imagens)

**O que faz**: Armazenamento de imagens em pasta compartilhada do Google Drive pessoal.

**Por que usamos**:
- **Gratuito**: Evita custos do Firebase Storage
- **Acessível**: Pasta compartilhada do Google Drive pessoal
- **Simples**: Upload manual e compartilhamento via link

**Como usamos**:
- Usuários fazem upload manual de imagens para pasta compartilhada do Google Drive
- Compartilham a imagem como "Qualquer pessoa com o link"
- Colam o link compartilhável no sistema
- O sistema converte automaticamente para URL de imagem direta (`https://lh3.googleusercontent.com/d/FILE_ID`)
- URLs são salvas no Firestore para referência futura

**Formato de URL**:
- Link compartilhável: `https://drive.google.com/file/d/FILE_ID/view?usp=sharing`
- URL de imagem direta: `https://lh3.googleusercontent.com/d/FILE_ID`

**Nota**: Upload automático via Google Drive API será implementado no futuro quando OAuth2 estiver configurado.

---

## 🚀 Deploy e Hospedagem

### GitHub Pages

**O que é**: Serviço de hospedagem gratuito do GitHub para sites estáticos.

**Por que usamos**:
- **Totalmente gratuito**
- Deploy automático via GitHub Actions
- Integração direta com repositório Git
- HTTPS automático
- Ideal para SPAs React compiladas

**Como usamos**:
- Build do Vite gera arquivos estáticos (`dist/`)
- GitHub Actions faz deploy automático no push
- Fallback SPA (`404.html`) para rotas client-side

### GitHub Actions

**O que é**: Sistema de CI/CD integrado ao GitHub para automação de workflows.

**Por que usamos**:
- Deploy automático no push
- Build configurado uma vez
- Sem necessidade de deploy manual
- Gratuito para projetos públicos

**Como usamos**:
- Workflow de build e deploy
- Instala dependências
- Faz build do projeto
- Faz deploy para GitHub Pages

---

## 📦 Ferramentas de Desenvolvimento

### npm / Node.js

**O que é**: Gerenciador de pacotes e runtime JavaScript.

**Por que usamos**:
- Padrão da indústria
- Instalação de dependências
- Scripts de desenvolvimento e build
- Ecossistema npm

---

### ESLint

**O que é**: Ferramenta de análise estática de código JavaScript.

**Por que usamos**:
- Padronização de código
- Detecção de erros comuns
- Melhor qualidade de código
- Boas práticas automáticas

**Como usamos**:
- Regras para React Hooks
- Regras para React Refresh (HMR)
- Configuração mínima e prática

---

## 🎯 Por Que Esta Stack?

### Requisitos do Projeto

1. **App estático**: Precisa rodar no GitHub Pages (não pode ter servidor)
2. **Autenticação**: Login com Google necessário
3. **Banco de dados**: Precisa armazenar dados online
4. **Gratuito**: Orçamento zero
5. **Desenvolvimento rápido**: Stack moderna e produtiva

### Solução Escolhida

- **React + Vite**: Desenvolvimento rápido, interface moderna, build otimizado
- **Firebase**: Resolve backend, auth e banco sem servidor próprio
- **GitHub Pages**: Hospedagem gratuita para apps estáticos

### Alternativas Consideradas e Rejeitadas

- **Next.js**: Seria overkill para este projeto (SSR não necessário)
- **HTML/CSS/JS puro**: Menos produtivo, mais código repetitivo
- **Supabase**: Ótima alternativa, mas Firebase é mais simples para começar
- **Vercel/Netlify**: Ótimas opções, mas GitHub Pages é gratuito e já temos o repo lá

---

## 📋 Dependências do Projeto

### Produção (`dependencies`)

- `react` - Biblioteca React
- `react-dom` - React para DOM
- `react-router-dom` - Roteamento client-side para React
- `firebase` - SDK do Firebase (Auth + Firestore)
- `echarts` - Biblioteca de gráficos Apache ECharts

### Desenvolvimento (`devDependencies`)

- `vite` - Build tool
- `@vitejs/plugin-react` - Plugin React para Vite
- `eslint` - Linter
- `eslint-plugin-react-hooks` - Regras ESLint para React Hooks
- `eslint-plugin-react-refresh` - Regras ESLint para HMR

---

## 🎯 Roteamento

### React Router

**O que é**: Biblioteca oficial do React para roteamento client-side em SPAs.

**Por que usamos**:
- Roteamento declarativo e intuitivo
- Suporte a rotas aninhadas
- Proteção de rotas (guards)
- Navegação programática
- Histórico do navegador (browser history)
- Ideal para múltiplas páginas na SPA

**Como usamos**:
- Configuração de rotas no componente raiz (`App.jsx`)
- Navegação entre páginas (Home, Dashboard, Charts, etc.)
- Rotas protegidas (apenas para usuários autenticados)
- Link components para navegação declarativa

---

## 📊 Visualização de Dados

### Apache ECharts

**O que é**: Biblioteca JavaScript poderosa e flexível para criação de gráficos interativos.

**Por que usamos**:
- Gráficos profissionais e bonitos
- Múltiplos tipos de gráficos (linha, barra, pizza, etc.)
- Interatividade nativa (zoom, tooltip, etc.)
- Responsivo por padrão
- Documentação excelente
- Performance otimizada
- Gratuito e open source

**Como usamos**:
- Visualização de histórico de contribuições
- Gráficos de quem deve comprar o próximo café
- Estatísticas de consumo
- Gráficos temporais (evolução ao longo do tempo)

---

## 🔄 Atualizações Futuras

Tecnologias que podem ser adicionadas no futuro:

- **Biblioteca de estilos** (CSS Modules, Styled Components) - Se necessário
- **Google Drive** - Armazenamento de imagens (já implementado - upload manual)
- **Biblioteca de notificações** - Para alertas de café acabando

---

**Última atualização**: Dezembro 2024

