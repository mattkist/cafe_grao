# Configuração do Firebase - CAFÉ GRÃO

Este documento contém instruções para configurar as regras de segurança do Firestore e os índices necessários.

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

