# 🛒 Ecommerce API --- NestJS + GraphQL + MongoDB {#shopping_cart-ecommerce-api--nestjs--graphql--mongodb}

API backend de um e-commerce desenvolvida para praticar **NestJS,
TypeScript, GraphQL, Apollo Server, Mongoose, MongoDB, autenticação JWT,
autorização por roles, testes automatizados e Docker**.

O projeto evoluiu de um CRUD inicial para uma aplicação modular com
**usuários, autenticação, autorização, produtos, categorias, carrinho,
pedidos, controle de estoque e pagamento simulado**.

> ⚠️ Projeto exclusivamente educacional. Não possui finalidade comercial
> e não deve ser utilizado diretamente em produção sem adequações de
> segurança, infraestrutura e observabilidade.

---

## 🎯 Objetivo {#dart-objetivo}

O projeto foi construído de forma incremental, começando pelos
fundamentos de uma API GraphQL e evoluindo para regras de negócio e
infraestrutura.

Principais conceitos praticados:

- GraphQL Code First
- Queries e Mutations
- Resolvers
- Inputs / DTOs
- Services e Dependency Injection
- Arquitetura modular do NestJS
- MongoDB e Mongoose
- Relacionamentos por ObjectId
- Validações e tratamento de exceções
- Autenticação com JWT
- Hash de senhas com bcrypt
- Autorização por roles
- Carrinho e pedidos
- Controle de estoque
- Pagamento simulado
- Testes automatizados com Jest
- Docker e Docker Compose
- Replica Set do MongoDB
- Healthcheck e inicialização automatizada do ambiente

---

# 🏗️ Arquitetura {#building_construction-arquitetura}

A aplicação utiliza a arquitetura modular do NestJS. Cada domínio possui
seus próprios componentes e responsabilidades.

```text
                         CLIENTE
                            │
                            ▼
                    ┌────────────────┐
                    │  GraphQL API   │
                    │    /graphql    │
                    └───────┬────────┘
                            │
                            ▼
                    ┌────────────────┐
                    │    Resolver    │
                    │ Query/Mutation │
                    └───────┬────────┘
                            │
                            ▼
                    ┌────────────────┐
                    │    Service     │
                    │ Regras negócio │
                    └───────┬────────┘
                            │
                            ▼
                    ┌────────────────┐
                    │    Mongoose    │
                    │      ODM       │
                    └───────┬────────┘
                            │
                            ▼
                    ┌────────────────┐
                    │    MongoDB     │
                    │   Replica Set  │
                    └────────────────┘
```

### Fluxo de uma requisição

Exemplo: `query products`.

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
Mongoose Model
   │
   ▼
MongoDB
   │
   ▼
ProductService
   │
   ▼
ProductResolver
   │
   ▼
Resposta GraphQL
```

A ideia é manter o Resolver focado na camada GraphQL e concentrar as
regras de negócio nos Services.

---

# 📁 Estrutura da aplicação {#file_folder-estrutura-da-aplicação}

```text
src/
│
├── auth/
│   ├── decorators/
│   │   ├── current-user.decorator.ts
│   │   └── roles.decorator.ts
│   ├── guards/
│   │   ├── jwt-auth.guard.ts
│   │   └── roles.guard.ts
│   ├── auth.module.ts
│   ├── auth.resolver.ts
│   └── auth.service.ts
│
├── product/
│   ├── dto/
│   │   ├── create-product.input.ts
│   │   └── update-product.input.ts
│   ├── entities/
│   │   └── product.entity.ts
│   ├── schemas/
│   │   └── product.schema.ts
│   ├── product.module.ts
│   ├── product.resolver.ts
│   └── product.service.ts
│
├── category/
│   ├── dto/
│   ├── entities/
│   ├── schemas/
│   ├── category.module.ts
│   ├── category.resolver.ts
│   └── category.service.ts
│
├── user/
│   ├── dto/
│   ├── entities/
│   ├── enums/
│   │   └── user-role.enum.ts
│   ├── schemas/
│   │   ├── user.schema.ts
│   │   └── ...
│   ├── user.module.ts
│   ├── user.resolver.ts
│   └── user.service.ts
│
├── cart/
│   ├── entities/
│   ├── schemas/
│   ├── cart.module.ts
│   ├── cart.resolver.ts
│   └── cart.service.ts
│
├── order/
│   ├── dto/
│   ├── entities/
│   ├── schemas/
│   ├── order.module.ts
│   ├── order.resolver.ts
│   └── order.service.ts
│
├── payment/
│   ├── entities/
│   ├── payment.module.ts
│   ├── payment.resolver.ts
│   └── payment.service.ts
│
├── app.module.ts
├── app.controller.ts
└── app.service.ts
```

> A estrutura pode evoluir conforme novos recursos forem adicionados.

---

# 🧩 Responsabilidade dos componentes {#jigsaw-responsabilidade-dos-componentes}

Componente Responsabilidade

---

**Module** Organiza e encapsula um domínio
**Resolver** Recebe Queries/Mutations GraphQL
**Service** Concentra regras de negócio
**Entity** Define tipos disponibilizados pelo GraphQL
**DTO / Input** Define dados de entrada da API
**Schema** Define documentos persistidos no MongoDB
**Guard** Controla acesso aos recursos
**Decorator** Adiciona metadados e facilita acesso ao contexto
**Mongoose** Comunicação entre NestJS e MongoDB
**MongoDB** Persistência dos dados

---

# 🧱 Módulos e responsabilidades {#bricks-módulos-e-responsabilidades}

## 🔐 Auth {#closed_lock_with_key-auth}

Responsável por autenticação e segurança relacionada ao acesso.

Fluxo:

```text
email + senha
     │
     ▼
AuthResolver
     │
     ▼
AuthService
     │
     ├── UserService.findByEmail()
     │
     ├── bcrypt.compare()
     │
     └── JwtService.signAsync()
     │
     ▼
accessToken
```

O JWT contém:

```text
sub
email
role
```

### JwtAuthGuard

Valida:

1.  Header `Authorization`
2.  Formato `Bearer <token>`
3.  Assinatura e validade do JWT
4.  Payload do usuário

Após a validação, o payload fica disponível em `request.user`.

### RolesGuard

A aplicação possui atualmente:

```text
USER
ADMIN
```

Recursos administrativos podem utilizar:

```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
```

Fluxo:

```text
Request
   │
   ▼
JwtAuthGuard
   │
   ▼
Token válido?
   │
   ▼
RolesGuard
   │
   ├── role permitida → acesso
   │
   └── role não permitida → Forbidden
```

---

## 👤 User {#bust_in_silhouette-user}

Responsável pelo gerenciamento dos usuários.

Recursos implementados:

- Criar usuário
- Listar usuários
- Buscar usuário
- Atualizar usuário
- Remover usuário
- Consultar o usuário autenticado (`me`)
- Atualizar próprio perfil
- Roles `USER` e `ADMIN`

As senhas são armazenadas utilizando hash com bcrypt.

---

## 🛍️ Product {#shopping-product}

Responsável pelos produtos e pelo estoque associado ao produto.

Principais operações:

```text
createProduct
products
product
updateProduct
deleteProduct
```

Um produto possui informações como:

```text
id
name
price
stock
description
categoryId
```

Exemplo:

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

## 🗂️ Category {#card_index_dividers-category}

Responsável pelo gerenciamento das categorias.

Principais operações:

```text
createCategory
categories
category
updateCategory
deleteCategory
```

O cadastro possui validação para evitar categorias duplicadas
considerando o nome sem diferenciação entre maiúsculas e minúsculas.

---

# 🔗 Product × Category {#link-product--category}

O relacionamento é realizado através de `categoryId`.

```text
┌──────────────┐
│   Product    │
├──────────────┤
│ id           │
│ name         │
│ price        │
│ stock        │
│ description  │
│ categoryId ──┼────────┐
└──────────────┘        │
                        ▼
                 ┌──────────────┐
                 │   Category   │
                 ├──────────────┤
                 │ id           │
                 │ name         │
                 │ description  │
                 └──────────────┘
```

Antes de criar um produto relacionado a uma categoria, a aplicação
verifica se a categoria existe.

---

## 🛒 Cart {#shopping_cart-cart}

O carrinho é associado ao usuário e contém itens com:

```text
productId
quantity
```

Principais operações internas:

```text
findOrCreate
addToCart
updateCartItem
removeFromCart
clearCart
```

### Regras implementadas

- Quantidade deve ser maior que zero
- `productId` deve ser válido
- Produto precisa existir
- Quantidade não pode ultrapassar o estoque
- Ao adicionar um produto existente, a quantidade é acumulada
- A quantidade acumulada também é validada
- Produto inexistente no carrinho não pode ser atualizado/removido
- Carrinho inexistente é tratado com exceção

---

## 📦 Order {#package-order}

Responsável pelo fluxo de pedidos.

O pedido integra conceitos de:

```text
Usuário
   │
   ▼
Carrinho
   │
   ▼
Produtos
   │
   ├── Quantidade
   ├── Preço
   └── Estoque
   │
   ▼
Pedido
   │
   ▼
Pagamento
```

O domínio possui seus próprios DTOs, entities e schemas.

---

## 📊 Estoque {#bar_chart-estoque}

O estoque é representado pelo campo:

```text
Product.stock
```

As regras de estoque são utilizadas nas operações do carrinho e do
pedido para impedir solicitações acima da quantidade disponível.

---

## 💳 Payment {#credit_card-payment}

O projeto possui um módulo de pagamento simulado.

O objetivo é praticar a separação de responsabilidades e representar o
fluxo de pagamento de um e-commerce sem integração com um gateway
financeiro real.

---

# 🧪 Testes {#test_tube-testes}

O projeto possui testes automatizados com **Jest**.

São testados componentes como:

- Services
- Resolvers
- Guards
- Autenticação
- Autorização
- Carrinho
- Regras de negócio
- Tratamento de exceções

Entre os cenários:

- CRUD
- Validações
- Usuário não encontrado
- Senha inválida
- Hash com bcrypt
- Geração de JWT
- Payload do JWT
- Token inválido/ausente
- Controle de roles
- Operações do carrinho

Executar:

```bash
npm test
```

Modo watch:

```bash
npm run test:watch
```

Cobertura:

```bash
npm run test:cov
```

---

# 🐳 Docker {#whale-docker}

O ambiente foi preparado para ser facilmente replicado por outro
desenvolvedor.

É possível executar **API + MongoDB** sem instalar Node.js ou MongoDB
diretamente na máquina.

O Compose utiliza três serviços:

```text
mongodb
mongo-init
api
```

## Fluxo de inicialização

```text
┌─────────────┐
│   mongodb   │
└──────┬──────┘
       │
       │ healthcheck
       ▼
┌─────────────┐
│  mongo-init │
│             │
│ verifica o  │
│ Replica Set │
└──────┬──────┘
       │
       │ concluído
       ▼
┌─────────────┐
│     api     │
│   NestJS    │
└─────────────┘
```

O serviço `mongo-init` inicializa automaticamente o Replica Set `rs0`
caso ainda não exista.

Isso elimina a necessidade de executar manualmente comandos como
`rs.initiate()` após clonar o projeto.

---

# 🐳 Dockerfile {#whale-dockerfile}

A API utiliza **multi-stage build**:

```dockerfile
# ---------- Stage 1: build ----------
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# ---------- Stage 2: production ----------
FROM node:22-alpine AS production

WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["node", "dist/main"]
```

### Builder

Instala dependências de desenvolvimento e compila a aplicação:

```text
TypeScript
   │
   ▼
npm run build
   │
   ▼
dist/
```

### Production

A imagem final contém:

- Node.js
- Dependências de produção
- Código compilado em `dist/`

As dependências de desenvolvimento não são copiadas para a imagem final.

---

# 💾 Persistência {#floppy_disk-persistência}

O MongoDB utiliza o volume:

```text
mongodb_data
```

Portanto:

```bash
docker compose down
```

mantém os dados.

Enquanto:

```bash
docker compose down -v
```

remove também o volume e realiza um reset completo do banco.

> ⚠️ `down -v` apaga os dados do MongoDB.

---

# 🔐 Variáveis de ambiente {#closed_lock_with_key-variáveis-de-ambiente}

O projeto utiliza:

```text
MONGODB_URI
JWT_SECRET
```

Crie o ambiente local a partir do exemplo:

```bash
cp .env.example .env
```

Exemplo:

```env
MONGODB_URI=mongodb://mongodb:27017/ecommerce?replicaSet=rs0
JWT_SECRET=coloque-um-segredo-aleatorio-aqui
```

### Por que `mongodb` e não `localhost`?

Dentro da rede Docker, a API encontra o MongoDB pelo nome do serviço:

```text
api → mongodb:27017
```

`localhost` dentro do container da API apontaria para o próprio
container da API, e não para o MongoDB.

O `.env` não deve ser enviado ao GitHub.

Para gerar um segredo JWT:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

# ▶️ Executando o projeto {#arrow_forward-executando-o-projeto}

## Pré-requisitos

Instale:

- Docker
- Docker Desktop

Não é necessário instalar Node.js ou MongoDB diretamente quando o
projeto é executado via Docker.

Verifique:

```bash
docker --version
docker compose version
```

## 1. Clonar {#1-clonar}

```bash
git clone <URL_DO_REPOSITORIO>
cd ecommerce-api
```

## 2. Criar `.env` {#2-criar-env}

```bash
cp .env.example .env
```

Configure o `JWT_SECRET`.

## 3. Subir o ambiente {#3-subir-o-ambiente}

```bash
docker compose up -d --build
```

Na primeira execução a API será construída.

Nas próximas:

```bash
docker compose up -d
```

## 4. Verificar {#4-verificar}

```bash
docker compose ps
```

## 5. GraphQL {#5-graphql}

```text
http://localhost:3000/graphql
```

---

# 🛠️ Comandos úteis {#hammer_and_wrench-comandos-úteis}

```bash
# Subir
docker compose up -d

# Subir reconstruindo as imagens
docker compose up -d --build

# Ver status
docker compose ps

# Logs de todos os serviços
docker compose logs -f

# Logs da API
docker compose logs -f api

# Parar containers mantendo dados
docker compose down

# Reset completo, incluindo dados do MongoDB
docker compose down -v

# Conferir a URI recebida pela API
docker exec ecommerce-api printenv MONGODB_URI
```

---

# 📡 GraphQL {#satellite-graphql}

A aplicação utiliza **GraphQL Code First**.

O schema é definido através de decorators TypeScript:

```typescript
@ObjectType()
@InputType()
@Field()
@Query()
@Mutation()
@Resolver()
```

O NestJS gera automaticamente o schema GraphQL.

Endpoint:

```text
http://localhost:3000/graphql
```

---

# 🛡️ Tratamento de erros {#shield-tratamento-de-erros}

A aplicação utiliza exceções do NestJS para representar situações
inválidas ou recursos inexistentes.

Exemplos utilizados no projeto:

```text
BadRequestException
UnauthorizedException
ForbiddenException
NotFoundException
ConflictException
```

Exemplos de regras:

```text
ID inválido
      ↓
BadRequestException

Usuário não encontrado
      ↓
NotFoundException

Token inválido
      ↓
UnauthorizedException

Role sem permissão
      ↓
ForbiddenException

Categoria duplicada
      ↓
ConflictException
```

---

# 🔒 Boas práticas aplicadas {#lock-boas-práticas-aplicadas}

O projeto busca manter:

- Separação de responsabilidades
- Arquitetura modular
- Services para regras de negócio
- Resolvers focados em GraphQL
- Schemas separados das Entities
- DTOs/Inputs para entrada de dados
- Senhas com bcrypt
- JWT para autenticação
- Guards para proteção
- Roles para autorização
- Variáveis de ambiente
- `.env` fora do Git
- `.env.example` versionado
- `.gitignore`
- `.dockerignore`
- Docker multi-stage
- Validação de referências
- Tratamento de exceções
- Testes automatizados

---

# 📈 Roadmap {#chart_with_upwards_trend-roadmap}

```text
1.  Product CRUD                  ✅
2.  Category CRUD                ✅
3.  Product + Category           ✅
4.  User CRUD                    ✅
5.  bcrypt                       ✅
6.  Login                        ✅
7.  JWT                          ✅
8.  JWT Guard                    ✅
9.  CurrentUser / me             ✅
10. Roles / Authorization        ✅
11. Carrinho                     ✅
12. Pedido / Order               ✅
13. Estoque                      ✅
14. Pagamento simulado           ✅
15. Validações                   ✅
16. Testes automatizados         ✅
17. Docker                       ✅
18. Deploy                       🚧
```

---

# 📚 Stack {#books-stack}

### Aplicação

- NestJS
- TypeScript
- GraphQL
- Apollo Server
- GraphQL Code First

### Banco

- MongoDB
- Mongoose
- MongoDB Replica Set

### Segurança

- bcrypt
- JWT
- Guards
- Roles

### Qualidade

- Jest
- ESLint
- Prettier

### Infraestrutura

- Docker
- Docker Compose
- Node.js 22 Alpine
- Multi-stage build
- Docker Volume
- Healthcheck
- `depends_on` com condições
- Inicialização automática do Replica Set

---

# 🎯 Resultado atual {#dart-resultado-atual}

O projeto deixou de ser apenas um CRUD e passou a representar um backend
de e-commerce com diferentes camadas de responsabilidade:

```text
                    ECOMMERCE API
                         │
        ┌────────────────┼────────────────┐
        │                │                │
     GraphQL          Segurança       Domínios
        │                │                │
   Resolvers       JWT + bcrypt      Product
        │           Guards + Roles    Category
     Services                         User
        │                              Cart
     Mongoose                         Order
        │                              Payment
     MongoDB
        │
   Replica Set
        │
      Docker
```

O próximo grande objetivo é disponibilizar essa aplicação em um ambiente
de **deploy**, mantendo a separação entre configuração local e produção.

---

# 📄 Licença {#page_facing_up-licença}

Projeto desenvolvido exclusivamente para fins de estudo e aprendizado.

Uso livre para fins educacionais.
