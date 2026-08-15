# 🛒 Ecommerce API — Estudo de GraphQL

Projeto pessoal criado com o objetivo de **aprender e praticar GraphQL** utilizando **NestJS**, **Apollo Server** e **MongoDB**. A ideia central é simular uma API de e-commerce, explorando os principais conceitos do GraphQL (Queries, Mutations, Resolvers, Inputs) integrados a um banco de dados real.

## 🎯 Objetivo

Este repositório não tem fins comerciais — é um projeto de estudo focado em consolidar conhecimento sobre:

- Como funciona uma API GraphQL na prática
- A diferença entre o modelo GraphQL e o modelo REST tradicional
- Como estruturar Resolvers, Services e Schemas usando a abordagem _code-first_
- Integração entre NestJS e MongoDB via Mongoose

ETAPAS:

1. Product CRUD
2. Category CRUD
3. Relacionar Product + Category ← estamos aqui
4. User
5. Autenticação JWT
6. Carrinho
7. Pedido / Order
8. Estoque
9. Pagamento (simulado)
10. Validações e tratamento de erros
11. Testes
12. Docker + Deploy

## 🧩 Arquitetura

A API segue uma estrutura em camadas, onde cada uma tem uma responsabilidade bem definida:

```
                    GraphQL API
                        │
              ┌─────────┴─────────┐
              │                   │
            Query              Mutation
              │                   │
       ┌──────┴──────┐      ┌─────┴─────┐
       │             │      │           │
   products      product   create      update
       │             │      │           │
       └─────────────┴──────┴───────────┘
                        │
                  ProductService
                        │
                    Mongoose
                        │
                     MongoDB
```

### Como funciona cada camada

| Camada                                                    | Responsabilidade                                                                       |
| --------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| **GraphQL API**                                           | Porta de entrada única (`/graphql`) por onde todas as requisições passam               |
| **Query / Mutation**                                      | Definem o que pode ser **consultado** (Query) e o que pode ser **alterado** (Mutation) |
| **Resolvers** (`products`, `product`, `create`, `update`) | Recebem a requisição e delegam a execução para o Service correspondente                |
| **ProductService**                                        | Contém a lógica de negócio da aplicação (validações, regras, tratamento de erros)      |
| **Mongoose**                                              | Faz a ponte entre o código Node.js/TypeScript e o MongoDB, traduzindo os comandos      |
| **MongoDB**                                               | Banco de dados onde os dados são efetivamente armazenados                              |

## ⚙️ Tecnologias utilizadas

- [NestJS](https://nestjs.com/) — framework Node.js para aplicações escaláveis
- [GraphQL](https://graphql.org/) — linguagem de consulta para APIs
- [Apollo Server](https://www.apollographql.com/) — driver GraphQL utilizado no projeto
- [Mongoose](https://mongoosejs.com/) — ODM para modelagem dos dados no MongoDB
- [MongoDB](https://www.mongodb.com/) — banco de dados NoSQL

## 🚀 Como rodar o projeto

```bash
# Instalar dependências
npm install

# Rodar em modo desenvolvimento
npm run start:dev
```

Após iniciar, acesse o **GraphQL Playground** em:

```
http://localhost:3000/graphql
```

## 📌 Exemplos de uso

### Query — Listar produtos

```graphql
query {
  products {
    id
    name
    price
    stock
    description
  }
}
```

### Mutation — Criar produto

```graphql
mutation {
  createProduct(
    input: {
      name: "Smartphone Galaxy S24"
      price: 4299.90
      stock: 15
      description: "Smartphone com 256GB e câmera tripla de 50MP"
    }
  ) {
    id
    name
    price
  }
}
```

## 📚 Aprendizados registrados neste projeto

- Configuração do GraphQL Module com abordagem _code-first_
- Criação de `@ObjectType`, `@InputType`, Queries e Mutations
- Tratamento de erros (ex: `NotFoundException`, validação de `ObjectId`)
- Separação de responsabilidades entre Resolver e Service
- Boas práticas de versionamento (`.gitignore`, variáveis de ambiente)

## ⚠️ Status do projeto

Projeto em desenvolvimento contínuo, com fins **exclusivamente educacionais**. Novas features e conceitos de GraphQL vão sendo adicionados conforme o aprendizado avança.

## 📄 Licença

Uso livre para fins de estudo e aprendizado.
