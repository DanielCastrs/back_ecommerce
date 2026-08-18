# 🛒 Ecommerce API — NestJS + GraphQL + MongoDB

Projeto pessoal desenvolvido com o objetivo de **aprender e praticar o desenvolvimento de APIs GraphQL** utilizando **NestJS, TypeScript, Apollo Server e MongoDB**.

A aplicação simula o backend de um e-commerce, permitindo praticar conceitos como:

- GraphQL
- Queries
- Mutations
- Resolvers
- Inputs
- Services
- MongoDB
- Mongoose
- CRUD
- Relacionamento entre documentos
- Validações
- Autenticação
- JWT
- Arquitetura modular do NestJS

> ⚠️ Este é um projeto exclusivamente educacional e não possui finalidade comercial.

---

## 🎯 Objetivo do projeto

O principal objetivo é construir um backend de e-commerce do zero, evoluindo a aplicação gradualmente e aplicando boas práticas de desenvolvimento.

Durante o projeto serão explorados conceitos de:

- API GraphQL
- Arquitetura Code First
- NestJS
- TypeScript
- Mongoose
- MongoDB
- Modelagem de dados
- Relacionamento entre documentos
- Regras de negócio
- Autenticação e autorização
- Tratamento de erros
- Testes automatizados
- Docker

---

# 🚀 Tecnologias utilizadas

- [NestJS](https://nestjs.com/) — framework para aplicações Node.js
- [TypeScript](https://www.typescriptlang.org/) — linguagem utilizada no projeto
- [GraphQL](https://graphql.org/) — linguagem de consulta para APIs
- [Apollo Server](https://www.apollographql.com/) — servidor GraphQL
- [Mongoose](https://mongoosejs.com/) — ODM para MongoDB
- [MongoDB](https://www.mongodb.com/) — banco de dados NoSQL
- [Docker](https://www.docker.com/) — containerização do banco de dados
- ESLint — análise e padronização do código
- Prettier — formatação do código

---

# 📋 Pré-requisitos

Antes de executar o projeto, é necessário ter instalado:

- Node.js
- NPM
- Docker
- Docker Desktop

Recomenda-se utilizar uma versão LTS do Node.js.

Para verificar as instalações:

```bash
node --version
npm --version
docker --version
docker compose version
```

---

# 📁 Estrutura do projeto

A aplicação utiliza a arquitetura modular do NestJS.

```text
src/
│
├── product/
│   ├── dto/
│   │   ├── create-product.input.ts
│   │   └── update-product.input.ts
│   │
│   ├── entities/
│   │   └── product.entity.ts
│   │
│   ├── schemas/
│   │   └── product.schema.ts
│   │
│   ├── product.module.ts
│   ├── product.resolver.ts
│   └── product.service.ts
│
├── category/
│   ├── dto/
│   │   ├── create-category.input.ts
│   │   └── update-category.input.ts
│   │
│   ├── entities/
│   │   └── category.entity.ts
│   │
│   ├── schemas/
│   │   └── category.schema.ts
│   │
│   ├── category.module.ts
│   ├── category.resolver.ts
│   └── category.service.ts
│
├── app.module.ts
├── app.controller.ts
└── app.service.ts
```

### Responsabilidade das principais camadas

| Camada | Responsabilidade |
|---|---|
| **Resolver** | Recebe as requisições GraphQL e direciona para o Service |
| **Service** | Contém as regras de negócio e comunicação com os Models |
| **Entity** | Define os objetos disponibilizados pelo GraphQL |
| **DTO / Input** | Define os dados recebidos pelas Queries e Mutations |
| **Schema** | Define a estrutura dos documentos no MongoDB |
| **Module** | Organiza e encapsula cada domínio da aplicação |
| **Mongoose** | Faz a comunicação entre NestJS e MongoDB |
| **MongoDB** | Armazena os dados da aplicação |

---

# 🧩 Arquitetura

A comunicação principal da aplicação segue o fluxo:

```text
                    Cliente
                       │
                       ▼
                  GraphQL API
                       │
              ┌────────┴────────┐
              │                 │
            Query            Mutation
              │                 │
              ▼                 ▼
           Resolver          Resolver
              │                 │
              └────────┬────────┘
                       │
                       ▼
                    Service
                       │
                       ▼
                   Mongoose
                       │
                       ▼
                    MongoDB
```

### Exemplo do fluxo de uma consulta

```text
Cliente
   │
   │ query products
   ▼
GraphQL
   │
   ▼
ProductResolver
   │
   ▼
ProductService
   │
   ▼
Mongoose
   │
   ▼
MongoDB
```

---

# 🐳 Banco de dados com Docker

O MongoDB utilizado pelo projeto é executado através do Docker Compose.

Na raiz do projeto deve existir um arquivo:

```text
docker-compose.yml
```

Para iniciar o banco:

```bash
docker compose up -d
```

O parâmetro `-d` executa os containers em segundo plano.

Para verificar os containers:

```bash
docker compose ps
```

Para visualizar os logs:

```bash
docker compose logs -f
```

Para parar os containers:

```bash
docker compose down
```

> O Docker Desktop precisa estar aberto e em execução antes de executar os comandos acima.

---

# 🔐 Variáveis de ambiente

O projeto utiliza variáveis de ambiente para configurar a conexão com o MongoDB.

Crie um arquivo `.env` na raiz do projeto:

```text
.env
```

Exemplo:

```env
MONGODB_URI=mongodb://localhost:27017/ecommerce
```

> Não envie o arquivo `.env` para o GitHub caso ele contenha informações sensíveis.

Adicione o arquivo ao `.gitignore`:

```text
.env
```

Se o projeto utilizar um arquivo `.env.example`, copie-o antes de executar a aplicação:

```bash
cp .env.example .env
```

No Windows, também é possível criar o arquivo `.env` manualmente.

---

# 📦 Instalação

Clone o repositório:

```bash
git clone <URL_DO_REPOSITORIO>
```

Entre na pasta do projeto:

```bash
cd ecommerce-api
```

Instale as dependências:

```bash
npm install
```

---

# ▶️ Executando o projeto

## 1. Iniciar o MongoDB

Na raiz do projeto:

```bash
docker compose up -d
```

Confirme se o container está executando:

```bash
docker compose ps
```

---

## 2. Instalar dependências

```bash
npm install
```

---

## 3. Iniciar a aplicação

Modo desenvolvimento:

```bash
npm run start:dev
```

Após a aplicação iniciar, o servidor estará disponível em:

```text
http://localhost:3000
```

A interface GraphQL estará disponível em:

```text
http://localhost:3000/graphql
```

---

# 🔄 Ordem recomendada para executar

Para facilitar a execução do projeto:

```bash
# 1. Iniciar o MongoDB
docker compose up -d

# 2. Instalar dependências
npm install

# 3. Iniciar a aplicação
npm run start:dev
```

Depois acesse:

```text
http://localhost:3000/graphql
```

---

# 📌 GraphQL

A aplicação utiliza a abordagem **Code First** do NestJS.

Os tipos GraphQL são definidos através de decorators TypeScript como:

```typescript
@ObjectType()
@InputType()
@Field()
@Query()
@Mutation()
@Resolver()
```

O schema GraphQL é gerado automaticamente a partir dessas definições.

---

# 🛍️ Product CRUD

O módulo `Product` possui as seguintes operações:

```text
Create Product
Read All Products
Read One Product
Update Product
Delete Product
```

---

## 🔎 Listar produtos

```graphql
query {
  products {
    id
    name
    price
    stock
    description
    categoryId
  }
}
```

---

## 🔎 Buscar produto por ID

```graphql
query {
  product(id: "PRODUCT_ID") {
    id
    name
    price
    stock
    description
    categoryId
  }
}
```

---

## ➕ Criar produto

Como o produto possui relacionamento com categoria, é necessário informar um `categoryId`.

```graphql
mutation {
  createProduct(
    input: {
      name: "Notebook Dell"
      price: 3500
      stock: 10
      description: "Notebook para trabalho"
      categoryId: "CATEGORY_ID"
    }
  ) {
    id
    name
    price
    stock
    description
    categoryId
  }
}
```

---

## ✏️ Atualizar produto

```graphql
mutation {
  updateProduct(
    input: {
      id: "PRODUCT_ID"
      price: 3200
      stock: 15
    }
  ) {
    id
    name
    price
    stock
    description
    categoryId
  }
}
```

---

## 🗑️ Excluir produto

```graphql
mutation {
  deleteProduct(id: "PRODUCT_ID") {
    id
    name
    price
    stock
  }
}
```

---

# 🗂️ Category CRUD

O módulo `Category` possui:

```text
Create Category
Read All Categories
Read One Category
Update Category
Delete Category
```

---

## ➕ Criar categoria

```graphql
mutation {
  createCategory(
    input: {
      name: "Eletrônicos"
      description: "Produtos eletrônicos"
    }
  ) {
    id
    name
    description
  }
}
```

---

## 🔎 Listar categorias

```graphql
query {
  categories {
    id
    name
    description
  }
}
```

---

## 🔎 Buscar categoria

```graphql
query {
  category(id: "CATEGORY_ID") {
    id
    name
    description
  }
}
```

---

## ✏️ Atualizar categoria

```graphql
mutation {
  updateCategory(
    input: {
      id: "CATEGORY_ID"
      name: "Eletrônicos e Informática"
      description: "Computadores, notebooks e acessórios"
    }
  ) {
    id
    name
    description
  }
}
```

---

## 🗑️ Excluir categoria

```graphql
mutation {
  deleteCategory(id: "CATEGORY_ID") {
    id
    name
    description
  }
}
```

---

# 🔗 Relacionamento Product + Category

O relacionamento entre Product e Category utiliza uma referência através do MongoDB/Mongoose.

```text
Product
│
├── id
├── name
├── price
├── stock
├── description
│
└── categoryId
        │
        ▼
     Category
        │
        ├── id
        ├── name
        └── description
```

O `categoryId` armazenado no Product representa o `_id` da Category.

Exemplo:

```text
Product
categoryId = 68xxxxxxxxxxxxxxxxxxxx

            │
            ▼

Category
_id = 68xxxxxxxxxxxxxxxxxxxx
```

O relacionamento impede a criação de produtos associados a categorias inexistentes.

---

# 🗺️ Roadmap do projeto

A evolução planejada do projeto é:

```text
1. Product CRUD                         ✅
2. Category CRUD                        ✅
3. Relacionar Product + Category        ✅
4. User                                 🚧
5. Autenticação JWT                     ⏳
6. Carrinho                             ⏳
7. Pedido / Order                       ⏳
8. Estoque                              ⏳
9. Pagamento (simulado)                 ⏳
10. Validações e tratamento de erros    ⏳
11. Testes                              ⏳
12. Docker + Deploy                     ⏳
```

### Legenda

- ✅ Concluído
- 🚧 Em desenvolvimento
- ⏳ Planejado

---

# 📚 Aprendizados

Durante o desenvolvimento do projeto estão sendo praticados:

- NestJS
- TypeScript
- GraphQL
- Apollo Server
- GraphQL Code First
- Queries
- Mutations
- Resolvers
- Inputs
- Object Types
- Services
- Modules
- Mongoose
- MongoDB
- CRUD
- Relacionamento entre documentos
- ObjectId
- Referências utilizando Mongoose
- Tratamento de erros
- `NotFoundException`
- Variáveis de ambiente
- Docker
- Docker Compose
- ESLint
- Prettier
- Boas práticas de organização de código

---

# 🧪 Testes

Os testes automatizados serão adicionados durante uma etapa posterior do projeto.

A previsão é implementar:

```text
Unit Tests
Integration Tests
E2E Tests
```

Ferramentas previstas:

- Jest
- Supertest

---

# 🛡️ Boas práticas

O projeto busca seguir algumas boas práticas:

- Separação de responsabilidades
- Arquitetura modular
- Services para regras de negócio
- Resolvers focados na camada GraphQL
- Schemas separados das Entities
- DTOs/Inputs para entrada de dados
- Variáveis de ambiente
- `.gitignore`
- Validação de referências entre documentos
- Tratamento de erros

---

# 📊 Status do projeto

🚧 **Em desenvolvimento**

Este projeto está sendo construído progressivamente como laboratório de estudos de:

**NestJS + TypeScript + GraphQL + Mongoose + MongoDB.**

Novos recursos serão adicionados conforme o avanço dos estudos.

---

# 📄 Licença

Este projeto é destinado exclusivamente para fins de estudo e aprendizado.

Uso livre para fins educacionais.
