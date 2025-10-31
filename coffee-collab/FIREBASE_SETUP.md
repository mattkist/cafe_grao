# Configuração do Firebase - CAFÉ GRÃO

Este documento contém instruções para configurar o Firebase, incluindo variáveis de ambiente, regras de segurança do Firestore e os índices necessários.

---

## 🔧 Configuração de Variáveis de Ambiente

⚠️ **IMPORTANTE**: Todas as configurações do Firebase devem ser configuradas via variáveis de ambiente. **Nunca commite credenciais diretamente no código!**

### Passo 1: Obter Configurações do Firebase

1. Acesse o [Firebase Console](https://console.firebase.google.com/)
2. Selecione o projeto `cafe-grao` (ou seu projeto)
3. Clique no ícone de **engrenagem** (⚙️) → **Configurações do projeto**
4. Role até a seção **Seus aplicativos**
5. Selecione o app web (ou crie um novo se necessário)
6. Copie os valores do objeto `firebaseConfig`

### Passo 2: Configurar Variáveis de Ambiente Local

1. No projeto, crie um arquivo `.env` na pasta `coffee-collab/` (se não existir)
2. Adicione as seguintes variáveis:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=sua-api-key-aqui
VITE_FIREBASE_AUTH_DOMAIN=seu-projeto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=seu-projeto-id
VITE_FIREBASE_STORAGE_BUCKET=seu-projeto.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=seu-sender-id
VITE_FIREBASE_APP_ID=seu-app-id
VITE_FIREBASE_MEASUREMENT_ID=seu-measurement-id

# Google OAuth (para Google Drive)
VITE_GOOGLE_CLIENT_ID=seu-client-id.apps.googleusercontent.com
VITE_GOOGLE_DRIVE_FOLDER_ID=seu-folder-id
```

**Exemplo com valores do projeto atual:**
```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=AIzaSyB654645aC7y9LYoqBx1C3nHpNrk
VITE_FIREBASE_AUTH_DOMAIN=seila.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=seila
VITE_FIREBASE_STORAGE_BUCKET=seila.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=6433654783
VITE_FIREBASE_APP_ID=1:62356046043:web:b409b6af5c4a7e7969fe
VITE_FIREBASE_MEASUREMENT_ID=G-HG1KHBHWHG

# Google OAuth (para Google Drive)
VITE_GOOGLE_CLIENT_ID=123456789-abcdefg.apps.googleusercontent.com
VITE_GOOGLE_DRIVE_FOLDER_ID=1a2b3c4d5e6f7g8h9i0j
```

⚠️ **NÃO** commite o arquivo `.env` no Git! Ele já deve estar no `.gitignore`.

### Passo 3: Configurar Variáveis de Ambiente no GitHub Pages

Como o `.env` não é publicado no GitHub Pages, você precisa configurar **GitHub Secrets**:

1. Acesse o repositório no GitHub
2. Vá em **Settings** → **Secrets and variables** → **Actions**
3. Clique em **"New repository secret"**
4. Crie os seguintes secrets (um para cada variável):

   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`
   - `VITE_FIREBASE_MEASUREMENT_ID`
   - `VITE_GOOGLE_CLIENT_ID` (se usar Google Drive)
   - `VITE_GOOGLE_DRIVE_FOLDER_ID` (se usar Google Drive)

⚠️ **Importante**: Os nomes dos secrets devem ser **EXATAMENTE** como acima (com `VITE_` no início).

#### Como Funciona?

- Durante o **build** no GitHub Actions, essas secrets são injetadas como variáveis de ambiente
- O Vite compila o código e **embute essas variáveis** no JavaScript final
- No navegador, essas variáveis são acessíveis via `import.meta.env.VITE_*`

📖 **Leia mais**: Veja a seção sobre variáveis de ambiente em `GOOGLE_DRIVE_SETUP.md`.

---

## ⚠️ IMPORTANTE: Configurar as Regras de Segurança

As regras de segurança do Firestore **DEVEM** ser configuradas no console do Firebase para que o sistema funcione corretamente.

### Passos para Configurar:

1. Acesse o [Firebase Console](https://console.firebase.google.com/)
2. Selecione o projeto `cafe-grao`
3. Vá em **Firestore Database** → **Rules**
4. Cole o conteúdo do arquivo `firestore.rules` nesta pasta
5. Clique em **Publish**

### Regras Necessárias:

As regras permitem:
- **Configurations**: Leitura para todos autenticados, escrita apenas para admins
- **Users**: Leitura para todos autenticados, escrita própria ou por admin
- **Contributions**: Leitura para todos autenticados, escrita livre para autenticados
- **Products**: Leitura e escrita para todos autenticados
- **Votes**: Leitura para todos autenticados, escrita apenas própria

## 📊 Índices Compostos Necessários

O Firestore pode solicitar a criação de índices compostos automaticamente quando você executar queries. Quando isso acontecer:

1. Clique no link fornecido no erro do console do navegador
2. Isso abrirá o console do Firebase com o índice pre-configurado
3. Clique em **Create Index**

### Índices Recomendados:

1. **Collection**: `contributions`
   - **Fields**: `userId` (Ascending), `purchaseDate` (Descending)
   - Usado em: `getContributionsByUser`

2. **Collection**: `contributions`
   - **Fields**: `productId` (Ascending), `purchaseDate` (Descending)
   - Usado em: Queries futuras por produto

3. **Collection**: `votes`
   - **Fields**: `userId` (Ascending), `productId` (Ascending)
   - Usado em: Verificar se usuário já votou em um produto

## 🔥 Firebase Storage - Habilitar e Configurar

### 1. Habilitar Firebase Storage

Se você receber erros de CORS ao tentar fazer upload, o Firebase Storage pode não estar habilitado:

1. Acesse o [Firebase Console](https://console.firebase.google.com/)
2. Selecione o projeto `cafe-grao`
3. Vá em **Storage** (se não aparecer, clique em **Get Started** ou **Adicionar outro produto**)
4. Escolha **Start in test mode** ou **Start in production mode**
5. Escolha a localização (ex: `southamerica-east1` para Brasil)
6. Clique em **Done**

### 2. Configurar Storage Rules

Após habilitar o Storage, configure as regras de segurança:

1. No Firebase Console, vá em **Storage** → **Rules**
2. Cole o conteúdo do arquivo `storage.rules` desta pasta:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Allow authenticated users to upload files for contributions
    match /contributions/{contributionId}/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
    
    // Allow authenticated users to upload files for products
    match /products/{productId}/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
    
    // Allow authenticated users to upload their own profile photos
    match /users/{userId}/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

3. Clique em **Publish**

### ⚠️ Nota sobre Erro de CORS

Se você ainda receber erro de CORS após configurar as regras:
- Verifique se o Firebase Storage está realmente habilitado
- Aguarde alguns minutos após habilitar o Storage
- Recarregue a página do aplicativo
- O sistema agora permite criar contribuições mesmo se o upload falhar (será exibido um aviso)

---

## ⚠️ Erros Comuns e Soluções

### Erro de BloomFilter

O erro `BloomFilter error` é um aviso interno do Firestore relacionado à sincronização de dados. **Pode ser ignorado** - não afeta o funcionamento do sistema. É apenas um warning no console.

### Erro de CORS no Storage

Se você receber erro de CORS ao fazer upload:
1. **Habilite o Firebase Storage** (veja instruções acima)
2. **Configure as regras do Storage** (veja instruções acima)
3. **Aguarde alguns minutos** após habilitar
4. **Recarregue a página** do aplicativo

### Sistema Funciona Sem Upload

**Importante**: O sistema foi projetado para funcionar mesmo se o upload de imagens falhar. As contribuições e produtos serão criados no Firestore, apenas as URLs das imagens ficarão vazias até que o Storage seja configurado corretamente.

---

**Nota**: Após configurar as regras, os erros de permissão devem desaparecer e o sistema funcionará corretamente.

