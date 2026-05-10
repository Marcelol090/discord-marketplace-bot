# Guia de Implementação - Ciclo 3

## 📋 Resumo Executivo

Este documento descreve as implementações do Ciclo 3: Webhooks Reais, Entrega Digital e Admin Dashboard.

### Arquivos Modificados

| Arquivo | Mudanças |
|---------|----------|
| `drizzle/schema.ts` | +5 colunas para entrega digital, +2 tabelas |
| `server/routers/admin.ts` | Novo arquivo com 10 procedures |
| `server/routers.ts` | Integração do adminRouter |
| `server/infrastructure/routes/payment-webhook.ts` | Trigger de entrega digital |
| `server/infrastructure/discord/DigitalDeliveryService.ts` | Novo serviço |
| `client/src/pages/admin/*.tsx` | 3 novos componentes |

---

## 🔧 Detalhes Técnicos

### 1. Schema Updates

#### Novas Colunas em `products`

```sql
ALTER TABLE products ADD COLUMN assetKey VARCHAR(255);
ALTER TABLE products ADD COLUMN isDigital BOOLEAN DEFAULT false;
```

**Uso**: Armazenar referência do arquivo digital (.otbm) e marcar produto como digital

#### Novas Colunas em `orders`

```sql
ALTER TABLE orders ADD COLUMN deliveryStatus ENUM('pending', 'sent', 'failed') DEFAULT 'pending';
ALTER TABLE orders ADD COLUMN deliveryAttempts INT DEFAULT 0;
ALTER TABLE orders ADD COLUMN lastDeliveryAttempt TIMESTAMP;
```

**Uso**: Rastrear status de entrega digital e tentativas

#### Novas Tabelas

```sql
CREATE TABLE clickAnalytics (
  id INT PRIMARY KEY AUTO_INCREMENT,
  productId INT,
  userId INT,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (productId) REFERENCES products(id),
  FOREIGN KEY (userId) REFERENCES users(id)
);

CREATE TABLE embedVariants (
  id INT PRIMARY KEY AUTO_INCREMENT,
  productId INT,
  variant VARCHAR(50),
  embedJson TEXT,
  FOREIGN KEY (productId) REFERENCES products(id)
);
```

---

### 2. DigitalDeliveryService

#### Métodos Principais

```typescript
// Entregar arquivo individual
async deliverDigitalAsset(
  userId: string,
  assetKey: string,
  productName: string
): Promise<boolean>

// Entregar múltiplos arquivos
async deliverMultipleAssets(
  userId: string,
  assets: Array<{ key: string; name: string }>
): Promise<{ successful: number; failed: number }>

// Notificar confirmação de pagamento
async notifyOrderConfirmed(
  userId: string,
  orderId: number,
  totalAmount: string
): Promise<void>

// Criar canal DM
private async createDMChannel(userId: string): Promise<DMChannel>
```

#### Fluxo de Entrega

```
1. Webhook recebe confirmação de pagamento
   ↓
2. Buscar pedido e itens do banco
   ↓
3. Filtrar produtos digitais
   ↓
4. Para cada produto digital:
   - Criar DM com usuário
   - Enviar arquivo .otbm
   - Atualizar status em BD
   ↓
5. Se falhar:
   - Registrar tentativa
   - Marcar como failed
   - Admin pode retentar
```

---

### 3. Payment Webhook Integration

#### Stripe Webhook Handler

```typescript
// Evento: payment_intent.succeeded
if (event.type === 'payment_intent.succeeded') {
  const paymentIntent = event.data.object;
  
  // 1. Buscar pedido no BD
  const order = await db.query(
    'SELECT * FROM orders WHERE paymentId = ?',
    [paymentIntent.id]
  );
  
  // 2. Atualizar status para 'paid'
  await db.update(orders)
    .set({ status: 'paid', updatedAt: new Date() })
    .where(eq(orders.id, order.id));
  
  // 3. Trigger entrega digital
  await digitalDeliveryService.triggerDelivery(order.id);
}
```

#### PIX Webhook Handler

```typescript
// Evento: PIX confirmado
if (event.type === 'pix_payment_confirmed') {
  // Mesmo fluxo do Stripe
  // 1. Buscar pedido
  // 2. Atualizar status
  // 3. Trigger entrega digital
}
```

---

### 4. Admin Router (tRPC)

#### Exemplo: getDashboardMetrics

```typescript
getDashboardMetrics: adminProcedure.query(async (opts) => {
  const db = await getDb();
  
  // Buscar métricas do BD
  const totalOrders = await db.select().from(orders);
  const totalRevenue = totalOrders.reduce(
    (sum, o) => sum + parseFloat(o.totalAmount), 
    0
  );
  
  return {
    totalOrders: totalOrders.length,
    totalRevenue: totalRevenue.toFixed(2),
    pendingOrders: totalOrders.filter(o => o.status === 'pending').length,
    deliveredOrders: totalOrders.filter(o => o.status === 'delivered').length,
    // ... mais métricas
  };
});
```

#### Exemplo: updateProductStock

```typescript
updateProductStock: adminProcedure
  .input(z.object({
    productId: z.number(),
    stock: z.number().min(0)
  }))
  .mutation(async (opts: any) => {
    const { productId, stock } = opts.input;
    const db = await getDb();
    
    await db.update(products)
      .set({ stock, updatedAt: new Date() })
      .where(eq(products.id, productId));
    
    return { success: true };
  });
```

---

### 5. React Components

#### AdminDashboard.tsx

```typescript
// Auto-refresh a cada 30 segundos
useEffect(() => {
  const interval = setInterval(() => {
    getDashboardMetrics.refetch();
    getSalesAnalytics.refetch();
  }, 30000);
  
  return () => clearInterval(interval);
}, []);

// Renderiza 4 métricas + 3 abas (Vendas, Produtos, Entrega)
```

#### OrdersManagement.tsx

```typescript
// Filtros
const filters = {
  status: OrderStatus,
  deliveryStatus: DeliveryStatus,
  paymentMethod: 'pix' | 'credit_card'
};

// Ações por pedido
- Ver detalhes (modal)
- Retentar entrega (se falhada)
- Atualizar status (dropdown)
```

#### ProductsManagement.tsx

```typescript
// Filtros
const filters = {
  isActive: boolean,
  isDigital: boolean
};

// Ações por produto
- Editar preço (input + botão)
- Editar estoque (input + botão)
- Ativar/desativar (toggle)
```

---

## 🧪 Testes

### Test Files Passando

```
✓ server/e2e/integration.e2e.test.ts (11 tests)
✓ server/e2e/discord-webhooks.e2e.test.ts (17 tests)
✓ server/infrastructure/discord/DigitalDeliveryService.test.ts (9 tests)
✓ server/supabase-credentials.test.ts (6 tests)
✓ server/infrastructure/routes/pix-webhook.test.ts (10 tests)
✓ server/infrastructure/discord/commands/ShopCommand.test.ts (5 tests)
✓ server/infrastructure/routes/payment-webhook.test.ts (7 tests)
✓ server/discord-credentials.test.ts (6 tests)
✓ server/e2e/shop-flow.e2e.test.ts (14 tests)

Total: 85 testes passando, 11 skipped
```

### Exemplos de Testes

```typescript
// Test: Entregar arquivo individual
test('deve entregar arquivo com sucesso', async () => {
  const result = await service.deliverDigitalAsset(
    'user123',
    'asset_abc123',
    'Mapa Boreas'
  );
  expect(result).toBe(true);
});

// Test: Retentar entrega falhada
test('deve retentar entrega falhada', async () => {
  const result = await service.deliverDigitalAsset(
    'user123',
    'invalid_asset',
    'Mapa'
  );
  expect(result).toBe(false);
  
  // Retentar
  const retry = await service.deliverDigitalAsset(
    'user123',
    'valid_asset',
    'Mapa'
  );
  expect(retry).toBe(true);
});
```

---

## 📊 Fluxos de Dados

### Fluxo 1: Compra com Entrega Digital

```
Cliente Discord
    ↓
/shop (lista produtos)
    ↓
Clica em "Comprar" (produto digital)
    ↓
/cart (adiciona ao carrinho)
    ↓
/checkout (inicia pagamento)
    ↓
Stripe/PIX (processa pagamento)
    ↓
Webhook (payment_intent.succeeded)
    ↓
DigitalDeliveryService.triggerDelivery()
    ↓
Cria DM com cliente
    ↓
Envia arquivo .otbm
    ↓
Atualiza status em BD
    ↓
Cliente recebe arquivo ✅
```

### Fluxo 2: Admin Retenta Entrega Falhada

```
Admin Dashboard
    ↓
Abre aba "Pedidos"
    ↓
Filtra por "deliveryStatus = failed"
    ↓
Clica em ícone "Retentar" (🔄)
    ↓
API: trpc.admin.retryDigitalDelivery()
    ↓
Reseta status para "pending"
    ↓
DigitalDeliveryService.triggerDelivery()
    ↓
Tenta enviar novamente
    ↓
Status atualizado em tempo real
```

### Fluxo 3: Admin Atualiza Preço/Estoque

```
Admin Dashboard
    ↓
Abre aba "Produtos"
    ↓
Clica em "Editar" do produto
    ↓
Modal abre com campos
    ↓
Admin insere novo preço/estoque
    ↓
Clica em "Atualizar"
    ↓
API: trpc.admin.updateProductStock/Price()
    ↓
BD é atualizado
    ↓
Mudança reflete em tempo real na vitrine Discord
```

---

## 🔐 Segurança

### Validações Implementadas

1. **Admin Procedure**: Todos os endpoints de admin requerem `ctx.user.role === 'admin'`
2. **Webhook Signature**: Stripe e PIX validam assinatura do webhook
3. **Rate Limiting**: Implementado em endpoints críticos
4. **Input Validation**: Zod schemas em todos os inputs

### Exemplo de Admin Procedure

```typescript
adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== 'admin') {
    throw new TRPCError({ code: 'FORBIDDEN' });
  }
  return next({ ctx });
});
```

---

## 🚀 Próximas Etapas

### Curto Prazo (1-2 semanas)

1. **Testar em Produção**: Deploy e teste com usuários reais
2. **Monitoramento**: Implementar alertas para entregas falhadas
3. **Documentação**: Criar guias para usuários finais

### Médio Prazo (1 mês)

1. **WebSocket**: Implementar atualizações em tempo real via WebSocket
2. **Notificações Push**: Notificar admin quando entrega falha
3. **Relatórios**: Exportar dados em PDF/Excel

### Longo Prazo (2-3 meses)

1. **Automação**: Criar workflows automáticos (ex: retentar automaticamente)
2. **Analytics Avançada**: Integrar com ferramentas de BI
3. **Multi-idioma**: Suportar múltiplos idiomas no painel

---

## 📚 Referências

- [Discord.js Documentation](https://discord.js.org/)
- [Stripe Webhooks](https://stripe.com/docs/webhooks)
- [tRPC Documentation](https://trpc.io/)
- [Drizzle ORM](https://orm.drizzle.team/)

---

**Versão**: 1.0
**Data**: Maio 2026
**Autor**: Manus AI
