# Referência de Queries e Mutations — ecommerce-api

## Autenticação

### Criar usuário
```graphql
mutation CreateUser {
  createUser(input: { name: "João Silva", email: "joao@email.com", password: "senha123" }) {
    id
    name
    email
    role
  }
}
```

### Login
```graphql
mutation Login {
  login(input: { email: "joao@email.com", password: "senha123" }) {
    accessToken
  }
}
```
> Use o `accessToken` retornado no header `Authorization: Bearer <token>` para as demais requisições autenticadas.

### Meu perfil
```graphql
query Me {
  me {
    id
    name
    email
    role
  }
}
```

### Atualizar meu perfil
```graphql
mutation UpdateMyProfile {
  updateMyProfile(input: { name: "João S. Silva", email: "joao.silva@email.com" }) {
    id
    name
    email
  }
}
```

---

## Usuários (admin)

### Listar usuários
```graphql
query Users {
  users {
    id
    name
    email
    role
  }
}
```

### Buscar usuário por id
```graphql
query User {
  user(id: "USER_ID") {
    id
    name
    email
    role
  }
}
```

### Atualizar usuário
```graphql
mutation UpdateUser {
  updateUser(input: { id: "USER_ID", name: "Novo nome", role: ADMIN }) {
    id
    name
    role
  }
}
```

### Deletar usuário
```graphql
mutation DeleteUser {
  deleteUser(id: "USER_ID") {
    id
    name
  }
}
```

---

## Categorias

### Criar categoria
```graphql
mutation CreateCategory {
  createCategory(input: { name: "Eletrônicos", description: "Produtos eletrônicos em geral" }) {
    id
    name
    description
  }
}
```

### Listar categorias
```graphql
query Categories {
  categories {
    id
    name
    description
    createdAt
  }
}
```

### Buscar categoria por id
```graphql
query Category {
  category(id: "CATEGORY_ID") {
    id
    name
    description
  }
}
```

### Atualizar categoria
```graphql
mutation UpdateCategory {
  updateCategory(input: { id: "CATEGORY_ID", name: "Eletrônicos e Informática" }) {
    id
    name
  }
}
```

### Deletar categoria
```graphql
mutation DeleteCategory {
  deleteCategory(id: "CATEGORY_ID") {
    id
    name
  }
}
```

---

## Produtos

### Criar produto
```graphql
mutation CreateProduct {
  createProduct(input: {
    name: "Smartphone Galaxy A55"
    description: "6.6\" AMOLED, 256GB, 8GB RAM"
    price: 1899.90
    stock: 40
    categoryId: "CATEGORY_ID"
  }) {
    id
    name
    price
    stock
  }
}
```

### Listar produtos
```graphql
query Products {
  products {
    id
    name
    description
    price
    stock
    category {
      id
      name
    }
  }
}
```

### Buscar produto por id
```graphql
query Product {
  product(id: "PRODUCT_ID") {
    id
    name
    description
    price
    stock
    category {
      name
    }
  }
}
```

### Atualizar produto
```graphql
mutation UpdateProduct {
  updateProduct(input: { id: "PRODUCT_ID", price: 1799.90, stock: 35 }) {
    id
    name
    price
    stock
  }
}
```

### Deletar produto
```graphql
mutation DeleteProduct {
  deleteProduct(id: "PRODUCT_ID") {
    id
    name
  }
}
```

---

## Carrinho

### Adicionar item ao carrinho
```graphql
mutation AddToCart {
  addToCart(input: { productId: "PRODUCT_ID", quantity: 2 }) {
    id
    total
    items {
      quantity
      subtotal
      product {
        name
        price
      }
    }
  }
}
```

### Ver meu carrinho
```graphql
query MyCart {
  myCart {
    id
    total
    items {
      quantity
      subtotal
      product {
        id
        name
        price
      }
    }
  }
}
```

### Atualizar quantidade de um item
```graphql
mutation UpdateCartItem {
  updateCartItem(input: { productId: "PRODUCT_ID", quantity: 3 }) {
    id
    total
    items {
      quantity
      subtotal
    }
  }
}
```

### Remover item do carrinho
```graphql
mutation RemoveFromCart {
  removeFromCart(productId: "PRODUCT_ID") {
    id
    total
    items {
      quantity
      product {
        name
      }
    }
  }
}
```

### Limpar carrinho
```graphql
mutation ClearCart {
  clearCart {
    id
    total
    items {
      quantity
    }
  }
}
```

---

## Pedidos

### Criar pedido (a partir do carrinho atual)
```graphql
mutation CreateOrder {
  createOrder {
    id
    status
    total
    items {
      name
      quantity
      unitPrice
      subtotal
    }
  }
}
```

### Meus pedidos
```graphql
query Orders {
  orders {
    id
    status
    total
    createdAt
    items {
      name
      quantity
      subtotal
    }
  }
}
```

### Todos os pedidos (admin)
```graphql
query AllOrders {
  allOrders {
    id
    status
    total
    createdAt
  }
}
```

### Buscar pedido por id
```graphql
query Order {
  order(id: "ORDER_ID") {
    id
    status
    total
    items {
      name
      quantity
      unitPrice
      subtotal
    }
  }
}
```

### Cancelar pedido
```graphql
mutation CancelOrder {
  cancelOrder(id: "ORDER_ID") {
    id
    status
  }
}
```

---

## Pagamento

### Pagar pedido
```graphql
mutation PayOrder {
  payOrder(input: { orderId: "ORDER_ID", method: PIX }) {
    id
    amount
    method
    status
    createdAt
  }
}
```
> `method` aceita: `PIX`, `CREDIT_CARD`, `BOLETO`
> `status` retorna: `APPROVED` ou `DECLINED`

---

## Enums de referência

- **UserRole**: `ADMIN`, `USER`
- **OrderStatus**: `PENDING`, `PAID`, `CANCELLED`
- **PaymentMethod**: `PIX`, `CREDIT_CARD`, `BOLETO`
- **PaymentStatus**: `APPROVED`, `DECLINED`
