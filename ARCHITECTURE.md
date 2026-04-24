# Arquitetura do Discord Marketplace Bot

## 🏗️ Visão Geral

O Discord Marketplace Bot segue os princípios de **Clean Architecture** com **Domain-Driven Design (DDD)**, garantindo separação de responsabilidades, testabilidade e manutenibilidade.

## 📊 Camadas da Arquitetura

### 1. **Presentation Layer** (Camada de Apresentação)
Responsável pela interface com o usuário (web e Discord).

**Componentes:**
- `client/src/pages/` - Páginas React (Shop, Cart, Checkout, Orders, Admin)
- `client/src/components/` - Componentes reutilizáveis (UI, DashboardLayout)
- `server/routers/marketplace.ts` - Routers tRPC (API)
- `server/infrastructure/routes/discord-webhook.ts` - Webhooks Discord

**Responsabilidades:**
- Renderizar interfaces
- Capturar interações do usuário
- Validar entrada com Zod
- Chamar serviços via tRPC

### 2. **Application Layer** (Camada de Aplicação)
Orquestra a lógica de negócio e coordena entre camadas.

**Componentes:**
- `server/routers/marketplace.ts` - Procedimentos tRPC (queries/mutations)
- `server/infrastructure/discord/commands/ShopCommand.ts` - Comandos Discord
- `server/infrastructure/discord/DiscordWebhookService.ts` - Processamento de webhooks

**Responsabilidades:**
- Orquestrar fluxos de negócio
- Validar regras de negócio
- Coordenar entre repositórios e serviços
- Mapear erros para respostas HTTP

### 3. **Domain Layer** (Camada de Domínio)
Contém a lógica de negócio pura, independente de frameworks.

**Componentes:**

#### Entidades (`server/domain/entities/`)
- `Product.ts` - Representa um produto
- `Category.ts` - Representa uma categoria
- `Order.ts` - Representa um pedido
- `Cart.ts` - Representa um carrinho
- `User.ts` - Representa um usuário

**Características:**
- Encapsulam regras de negócio
- Métodos de validação
- Tipos e enums específicos do domínio

#### Repositórios (`server/domain/repositories/`)
- `IProductRepository.ts` - Interface para operações de produtos
- `ICategoryRepository.ts` - Interface para operações de categorias
- `IOrderRepository.ts` - Interface para operações de pedidos
- `ICartRepository.ts` - Interface para operações de carrinho

**Características:**
- Definem contratos (interfaces)
- Independentes de implementação
- Abstraem acesso a dados

#### Serviços (`server/domain/services/`)
- `ProductService.ts` - Lógica de produtos
- `CategoryService.ts` - Lógica de categorias
- `OrderService.ts` - Lógica de pedidos
- `CartService.ts` - Lógica de carrinho
- `PaymentService.ts` - Lógica de pagamentos

**Características:**
- Implementam casos de uso
- Usam repositórios (interfaces)
- Contêm regras de negócio

### 4. **Infrastructure Layer** (Camada de Infraestrutura)
Implementações técnicas e integrações externas.

**Componentes:**

#### Repositórios (`server/infrastructure/repositories/`)
- `ProductRepository.ts` - Implementação de IProductRepository
- `CategoryRepository.ts` - Implementação de ICategoryRepository
- `OrderRepository.ts` - Implementação de IOrderRepository
- `CartRepository.ts` - Implementação de ICartRepository

**Características:**
- Implementam interfaces do domínio
- Acessam banco de dados via Drizzle ORM
- Convertem dados entre domínio e persistência

#### Serviços Externos
- `server/infrastructure/discord/` - Integração Discord
- `server/infrastructure/di/container.ts` - Injeção de dependências (TSyringe)

#### Banco de Dados
- `drizzle/schema.ts` - Definição de tabelas
- `server/db.ts` - Helpers de query
- Migrações automáticas

#### Rotas HTTP
- `server/infrastructure/routes/discord-webhook.ts` - Webhook Discord
- `server/_core/` - Framework core (OAuth, storage, etc)

## 🔄 Fluxo de Dados

### Exemplo: Listar Produtos

```
1. Frontend (React)
   └─> trpc.marketplace.products.list.useQuery()

2. Application Layer (tRPC Router)
   └─> marketplaceRouter.products.list.query()

3. Domain Layer (Service)
   └─> ProductService.getActiveProducts()

4. Domain Layer (Repository Interface)
   └─> IProductRepository.getActive()

5. Infrastructure Layer (Repository Implementation)
   └─> ProductRepository.getActive()
   └─> db.select().from(products).where(...)

6. Database
   └─> MySQL Query

7. Response Flow (Inverso)
   └─> Dados retornam pelas camadas
   └─> Frontend renderiza componentes
```

### Exemplo: Criar Pedido

```
1. Frontend (React)
   └─> trpc.marketplace.orders.create.useMutation()

2. Application Layer (tRPC Router)
   └─> marketplaceRouter.orders.create.mutation()
   └─> Validação com Zod

3. Domain Layer (Service)
   └─> OrderService.createOrder()
   └─> Validações de negócio
   └─> CartService.clearCart()

4. Infrastructure Layer (Repositories)
   └─> OrderRepository.create()
   └─> CartRepository.clear()

5. Database
   └─> INSERT orders
   └─> DELETE cart_items

6. Response
   └─> Retorna pedido criado
```

## 🔐 Padrões de Design

### 1. **Dependency Injection (TSyringe)**
Todas as dependências são injetadas via container:

```typescript
@injectable()
export class ProductService {
  constructor(
    private productRepository: IProductRepository
  ) {}
}
```

### 2. **Repository Pattern**
Abstração de acesso a dados:

```typescript
interface IProductRepository {
  getActive(): Promise<Product[]>;
  getById(id: number): Promise<Product | null>;
  create(data: CreateProductData): Promise<Product>;
}
```

### 3. **Service Layer**
Lógica de negócio encapsulada:

```typescript
@injectable()
export class OrderService {
  async createOrder(data: CreateOrderData): Promise<Order> {
    // Validações
    // Cálculos
    // Chamadas a repositórios
  }
}
```

### 4. **tRPC Procedures**
Endpoints tipados e validados:

```typescript
create: protectedProcedure
  .input(CreateOrderSchema)
  .mutation(async ({ input, ctx }) => {
    return await orderService.createOrder(input);
  })
```

## 📁 Estrutura de Pastas

```
discord-marketplace-bot/
├── client/                          # Frontend React
│   ├── src/
│   │   ├── pages/                  # Páginas (Shop, Cart, Checkout, etc)
│   │   ├── components/             # Componentes reutilizáveis
│   │   ├── lib/trpc.ts             # Cliente tRPC
│   │   └── App.tsx                 # Roteamento
│   └── public/                     # Assets estáticos
│
├── server/                          # Backend Node.js
│   ├── domain/                     # Camada de Domínio (DDD)
│   │   ├── entities/               # Entidades de negócio
│   │   ├── repositories/           # Interfaces de repositórios
│   │   └── services/               # Serviços de negócio
│   │
│   ├── infrastructure/             # Camada de Infraestrutura
│   │   ├── repositories/           # Implementações de repositórios
│   │   ├── discord/                # Integração Discord
│   │   ├── routes/                 # Rotas HTTP
│   │   └── di/                     # Injeção de dependências
│   │
│   ├── routers/                    # Camada de Aplicação
│   │   └── marketplace.ts          # Routers tRPC
│   │
│   ├── _core/                      # Framework core
│   │   ├── index.ts                # Entrada do servidor
│   │   ├── context.ts              # Contexto tRPC
│   │   ├── trpc.ts                 # Configuração tRPC
│   │   ├── oauth.ts                # Manus OAuth
│   │   └── ...
│   │
│   ├── routers.ts                  # Agregador de routers
│   └── db.ts                       # Helpers de banco
│
├── drizzle/                        # Schema e Migrações
│   ├── schema.ts                   # Definição de tabelas
│   └── migrations/                 # Arquivos SQL
│
├── shared/                         # Código compartilhado
│   ├── discord-types.ts            # Tipos Discord
│   └── const.ts                    # Constantes
│
├── Dockerfile                      # Build para produção
├── docker-compose.yml              # Orquestração local
├── README.md                       # Documentação
└── ARCHITECTURE.md                 # Este arquivo
```

## 🔄 Ciclo de Vida de uma Feature

### 1. **Planejamento**
- Definir entidade/domínio
- Identificar repositórios necessários
- Planejar serviços

### 2. **Implementação do Domínio**
- Criar entidade em `domain/entities/`
- Criar interface de repositório em `domain/repositories/`
- Criar serviço em `domain/services/`

### 3. **Implementação da Infraestrutura**
- Atualizar schema em `drizzle/schema.ts`
- Gerar migração com `pnpm drizzle-kit generate`
- Implementar repositório em `infrastructure/repositories/`

### 4. **Implementação da Aplicação**
- Criar router tRPC em `routers/`
- Registrar em `routers.ts`

### 5. **Implementação da Apresentação**
- Criar página/componente em `client/src/pages/`
- Chamar tRPC procedures
- Adicionar testes

### 6. **Testes**
- Testes unitários para serviços
- Testes de integração para routers
- Testes E2E para fluxos completos

## 🧪 Testabilidade

A arquitetura favorece testes:

```typescript
// Mock de repositório para testes
class MockProductRepository implements IProductRepository {
  async getActive(): Promise<Product[]> {
    return [/* mock data */];
  }
}

// Teste do serviço
describe('ProductService', () => {
  it('should return active products', async () => {
    const repo = new MockProductRepository();
    const service = new ProductService(repo);
    const products = await service.getActiveProducts();
    expect(products).toHaveLength(1);
  });
});
```

## 🚀 Escalabilidade

### Adicionar Nova Feature (ex: Wishlist)

1. **Domínio**
   - `domain/entities/Wishlist.ts`
   - `domain/repositories/IWishlistRepository.ts`
   - `domain/services/WishlistService.ts`

2. **Infraestrutura**
   - `drizzle/schema.ts` → adicionar tabela `wishlists`
   - `infrastructure/repositories/WishlistRepository.ts`

3. **Aplicação**
   - `routers/wishlist.ts` → procedures tRPC
   - `routers.ts` → registrar router

4. **Apresentação**
   - `client/src/pages/Wishlist.tsx`
   - `client/src/components/WishlistButton.tsx`

## 📚 Referências

- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Domain-Driven Design](https://martinfowler.com/bliki/DomainDrivenDesign.html)
- [tRPC Documentation](https://trpc.io)
- [Drizzle ORM](https://orm.drizzle.team)
- [TSyringe](https://github.com/Microsoft/tsyringe)

---

**Desenvolvido com ❤️ usando Manus API**
