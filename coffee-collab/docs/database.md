# Estrutura do Banco de Dados - CAFÉ GRÃO

Este documento descreve a estrutura completa do banco de dados Firestore utilizada no sistema.

> **⚠️ IMPORTANTE**: Toda estrutura do banco de dados (nomes de collections, documentos, campos) deve estar em **INGLÊS**.

---

## 📊 Collections

### 1. `configurations`

Armazena configurações globais do sistema.

**Estrutura do Documento**:
```javascript
{
  id: string,              // ID único do documento
  name: string,            // Nome da configuração
  description: string,     // Descrição da configuração
  value: any               // Valor da configuração (pode ser string, number, etc.)
}
```

**Configurações Padrão**:
- `calculationBaseMonths`: Number (default: 6) - Quantidade de meses para base de cálculo de contribuições

**Regras de Segurança**:
- Leitura: Todos usuários autenticados
- Escrita: Apenas administradores (`isAdmin: true`)

---

### 2. `users`

Armazena perfis de usuários do sistema.

**Estrutura do Documento**:
```javascript
{
  id: string,              // ID único (mesmo do Firebase Auth UID)
  email: string,           // Email do usuário
  name: string,            // Nome completo
  photoURL: string | null, // URL da foto de perfil
  isAdmin: boolean,        // Indica se o usuário é administrador
  isActive: boolean,       // Indica se o usuário está ativo
  createdAt: Timestamp,    // Data de criação do perfil
  updatedAt: Timestamp     // Data de última atualização
}
```

**Regras Especiais**:
- Se não houver nenhum admin no banco, o primeiro usuário que fizer login automaticamente se torna admin (`isAdmin: true`)
- Ao criar novo usuário, `isActive` começa como `false`
- Ao criar novo usuário, envia email para todos os admins notificando sobre o novo cadastro

**Regras de Segurança**:
- Leitura: Todos usuários autenticados
- Escrita: Usuário pode editar seu próprio perfil OU admins podem editar qualquer perfil

---

### 3. `contributions`

Armazena todas as contribuições (compras de café) registradas.

**Estrutura do Documento**:
```javascript
{
  id: string,                      // ID único do documento (gerado automaticamente)
  userId: string,                   // FK: ID do usuário que contribuiu (reference to users)
  purchaseDate: Timestamp,          // Data da compra
  value: number,                    // Valor gasto (R$)
  quantityKg: number,              // Quantidade comprada (em KG)
  productId: string,               // FK: ID do produto/café (reference to products)
  purchaseEvidence: string | null, // URL da imagem/comprovante da compra
  arrivalEvidence: string | null,  // URL da imagem/evidência da chegada
  arrivalDate: Timestamp | null,   // Data de chegada do café
  createdAt: Timestamp,            // Data de criação do registro
  updatedAt: Timestamp             // Data de última atualização
}
```

**Regras de Negócio**:
- Ao criar contribuição, `purchaseEvidence` é obrigatório
- `arrivalEvidence` e `arrivalDate` são opcionais inicialmente
- Se `arrivalEvidence` for adicionada e o produto ainda não tiver foto, essa evidência vira a foto do produto
- Ao atualizar uma contribuição de um produto existente, recalcular `averagePricePerKg` do produto

**Regras de Segurança**:
- Leitura: Todos usuários autenticados
- Escrita: Todos usuários autenticados (admins podem criar para qualquer usuário, usuários comuns apenas para si mesmos)

---

### 4. `products`

Armazena produtos/cafés disponíveis no sistema.

**Estrutura do Documento**:
```javascript
{
  id: string,                    // ID único do documento (gerado automaticamente)
  name: string,                  // Nome do produto/café
  description: string | null,    // Descrição do produto
  photoURL: string | null,       // URL da foto do produto
  averagePricePerKg: number,     // Média de preço por KG (calculado automaticamente)
  averageRating: number          // Média de pontuação (0-5, arredondada em meia estrela)
}
```

**Regras de Negócio**:
- `averagePricePerKg`: Calculado automaticamente somando todos os valores de contribuições para este produto e dividindo pela soma de todos os KGs
- `averageRating`: Calculado automaticamente somando todas as pontuações e dividindo pelo total de votos (arredondado para meia estrela)
- Produtos criados automaticamente via modal de contribuição começam com:
  - `description: null`
  - `photoURL: null`
  - `averagePricePerKg`: valor informado / kg informado
  - `averageRating: 0`

**Regras de Segurança**:
- Leitura: Todos usuários autenticados
- Escrita: Todos usuários autenticados

---

### 5. `votes`

Armazena votos/avaliações dos usuários sobre os produtos.

**Estrutura do Documento**:
```javascript
{
  id: string,           // ID único do documento (gerado automaticamente)
  userId: string,       // FK: ID do usuário que votou (reference to users)
  productId: string,    // FK: ID do produto votado (reference to products)
  rating: number       // Pontuação (0-5, permitindo meia estrela: 0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5)
}
```

**Regras de Negócio**:
- Cada usuário pode votar apenas uma vez por produto
- Se usuário votar novamente no mesmo produto, atualiza o voto existente (não cria novo)
- Ao votar ou atualizar voto, recalcular `averageRating` do produto correspondente
- `averageRating` = soma de todos os ratings / total de votos (arredondado para meia estrela)

**Regras de Segurança**:
- Leitura: Todos usuários autenticados
- Escrita: Usuário pode votar apenas para si mesmo

---

## 🔗 Relacionamentos

```
users (1) ────< (N) contributions
products (1) ────< (N) contributions
users (1) ────< (N) votes
products (1) ────< (N) votes
```

**Regras de Integridade**:
- Ao deletar um produto, manter contribuições e votos (não deletar em cascata)
- Ao deletar um usuário, manter contribuições e votos (histórico preservado)
- Referências são armazenadas como `string` (ID do documento)

---

## 📐 Índices Recomendados

Para performance em queries, criar índices compostos:

1. `contributions`: `userId` + `purchaseDate` (desc)
2. `contributions`: `productId` + `purchaseDate` (desc)
3. `votes`: `userId` + `productId` (único)
4. `votes`: `productId` + `rating` (desc)

---

## 🔄 Cálculos Automáticos

### Average Price Per KG (produtos)

```
averagePricePerKg = 
  SUM(contributions WHERE productId = X).value / 
  SUM(contributions WHERE productId = X).quantityKg
```

**Quando recalcular**:
- Ao criar nova contribuição
- Ao atualizar valor ou quantidade de uma contribuição existente
- Ao deletar uma contribuição

### Average Rating (produtos)

```
averageRating = 
  SUM(votes WHERE productId = X).rating / 
  COUNT(votes WHERE productId = X)
```

**Arredondamento**: Sempre para meia estrela mais próxima (0, 0.5, 1, 1.5, ..., 5)

**Quando recalcular**:
- Ao criar novo voto
- Ao atualizar voto existente
- Ao deletar um voto

---

## 🔒 Regras de Segurança (Firestore Rules)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Configurations - leitura livre, escrita apenas por admins
    match /configurations/{configId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;
    }
    
    // Users - leitura livre, escrita própria ou por admin
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && (
        request.auth.uid == userId ||
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true
      );
    }
    
    // Contributions - leitura livre, escrita por todos (admins podem criar para qualquer um)
    match /contributions/{contributionId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && (
        resource.data.userId == request.auth.uid ||
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true
      );
    }
    
    // Products - leitura livre, escrita por todos
    match /products/{productId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
    
    // Votes - leitura livre, escrita apenas própria
    match /votes/{voteId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
  }
}
```

---

**Última atualização**: Dezembro 2024

