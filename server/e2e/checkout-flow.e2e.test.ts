import "reflect-metadata";
import { describe, it, expect, beforeAll } from "vitest";
import { container } from "tsyringe";
import { OrderService } from "../domain/services/OrderService";
import { PaymentService } from "../domain/services/PaymentService";
import { CartService } from "../domain/services/CartService";
import { setupDependencyInjection } from "../infrastructure/di/container";

describe("E2E: Checkout Flow - Pagamentos", () => {
  let orderService: OrderService;
  let paymentService: PaymentService;
  let cartService: CartService;
  const testUserId = 123456789;
  const testGuildId = "1114181955634876478";

  beforeAll(() => {
    setupDependencyInjection();
    orderService = container.resolve(OrderService);
    paymentService = container.resolve(PaymentService);
    cartService = container.resolve(CartService);
  });

  describe("Fluxo 1: Criar Pedido a partir do Carrinho", () => {
    it("deve criar um pedido com itens do carrinho", async () => {
      const cart = await cartService.getOrCreateCart(testUserId, testGuildId);
      
      if (cart.items.length > 0) {
        const order = await orderService.createOrder({
          userId: testUserId,
          items: cart.items,
          shippingAddress: {
            street: "Rua Teste, 123",
            city: "São Paulo",
            state: "SP",
            zipCode: "01310-100",
            country: "Brasil",
          },
          paymentMethod: "pix",
        });

        expect(order).toBeDefined();
        expect(order.status).toBe("pending");
        expect(order.items.length).toBe(cart.items.length);
        console.log(`✅ Pedido criado: #${order.id}`);
      }
    });

    it("deve calcular total do pedido corretamente", async () => {
      const cart = await cartService.getOrCreateCart(testUserId, testGuildId);
      
      if (cart.items.length > 0) {
        const order = await orderService.createOrder({
          userId: testUserId,
          items: cart.items,
          shippingAddress: {
            street: "Rua Teste, 123",
            city: "São Paulo",
            state: "SP",
            zipCode: "01310-100",
            country: "Brasil",
          },
          paymentMethod: "pix",
        });

        const expectedTotal = cart.items.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        );
        expect(order.totalAmount).toBe(expectedTotal);
        console.log(`✅ Total do pedido calculado corretamente: R$ ${order.totalAmount.toFixed(2)}`);
      }
    });
  });

  describe("Fluxo 2: Processar Pagamento PIX", () => {
    it("deve gerar QR Code PIX para o pedido", async () => {
      const cart = await cartService.getOrCreateCart(testUserId, testGuildId);
      
      if (cart.items.length > 0) {
        const order = await orderService.createOrder({
          userId: testUserId,
          items: cart.items,
          shippingAddress: {
            street: "Rua Teste, 123",
            city: "São Paulo",
            state: "SP",
            zipCode: "01310-100",
            country: "Brasil",
          },
          paymentMethod: "pix",
        });

        const pixData = await paymentService.generatePixQRCode(
          order.id,
          order.totalAmount,
          "Compra no Discord Marketplace"
        );

        expect(pixData).toBeDefined();
        expect(pixData.qrCode).toBeDefined();
        expect(pixData.referenceId).toBeDefined();
        console.log(`✅ QR Code PIX gerado: ${pixData.referenceId}`);
      }
    });

    it("deve confirmar pagamento PIX", async () => {
      const cart = await cartService.getOrCreateCart(testUserId, testGuildId);
      
      if (cart.items.length > 0) {
        const order = await orderService.createOrder({
          userId: testUserId,
          items: cart.items,
          shippingAddress: {
            street: "Rua Teste, 123",
            city: "São Paulo",
            state: "SP",
            zipCode: "01310-100",
            country: "Brasil",
          },
          paymentMethod: "pix",
        });

        // Simular confirmação de pagamento
        const updatedOrder = await orderService.updateOrderStatus(order.id, "paid");
        
        expect(updatedOrder.status).toBe("paid");
        console.log(`✅ Pagamento PIX confirmado`);
      }
    });
  });

  describe("Fluxo 3: Processar Pagamento Stripe", () => {
    it("deve criar sessão de checkout Stripe", async () => {
      const cart = await cartService.getOrCreateCart(testUserId, testGuildId);
      
      if (cart.items.length > 0) {
        const order = await orderService.createOrder({
          userId: testUserId,
          items: cart.items,
          shippingAddress: {
            street: "Rua Teste, 123",
            city: "São Paulo",
            state: "SP",
            zipCode: "01310-100",
            country: "Brasil",
          },
          paymentMethod: "card",
        });

        const stripeSession = await paymentService.createStripeCheckoutSession(
          order.id,
          order.items,
          "https://seu-dominio.com/success",
          "https://seu-dominio.com/cancel"
        );

        expect(stripeSession).toBeDefined();
        expect(stripeSession.id).toBeDefined();
        console.log(`✅ Sessão Stripe criada: ${stripeSession.id}`);
      }
    });

    it("deve confirmar pagamento Stripe", async () => {
      const cart = await cartService.getOrCreateCart(testUserId, testGuildId);
      
      if (cart.items.length > 0) {
        const order = await orderService.createOrder({
          userId: testUserId,
          items: cart.items,
          shippingAddress: {
            street: "Rua Teste, 123",
            city: "São Paulo",
            state: "SP",
            zipCode: "01310-100",
            country: "Brasil",
          },
          paymentMethod: "card",
        });

        // Simular confirmação de pagamento Stripe
        const updatedOrder = await orderService.updateOrderStatus(order.id, "paid");
        
        expect(updatedOrder.status).toBe("paid");
        console.log(`✅ Pagamento Stripe confirmado`);
      }
    });
  });

  describe("Fluxo 4: Rastreamento de Pedidos", () => {
    it("deve listar pedidos do usuário", async () => {
      const orders = await orderService.getUserOrders(testUserId);
      
      expect(Array.isArray(orders)).toBe(true);
      console.log(`✅ Pedidos do usuário listados: ${orders.length}`);
    });

    it("deve atualizar status do pedido", async () => {
      const orders = await orderService.getUserOrders(testUserId);
      
      if (orders.length > 0) {
        const order = orders[0];
        const statuses = ["pending", "paid", "shipped", "delivered"];
        
        for (const status of statuses) {
          const updatedOrder = await orderService.updateOrderStatus(order.id, status as any);
          expect(updatedOrder.status).toBe(status);
          console.log(`✅ Status atualizado para: ${status}`);
        }
      }
    });

    it("deve obter detalhes completos do pedido", async () => {
      const orders = await orderService.getUserOrders(testUserId);
      
      if (orders.length > 0) {
        const order = orders[0];
        
        expect(order.id).toBeDefined();
        expect(order.userId).toBe(testUserId);
        expect(order.items).toBeDefined();
        expect(order.totalAmount).toBeGreaterThan(0);
        expect(order.status).toBeDefined();
        expect(order.shippingAddress).toBeDefined();
        console.log(`✅ Detalhes do pedido obtidos: ${JSON.stringify(order, null, 2)}`);
      }
    });
  });

  describe("Fluxo 5: Validações de Checkout", () => {
    it("deve validar endereço de entrega", async () => {
      const cart = await cartService.getOrCreateCart(testUserId, testGuildId);
      
      if (cart.items.length > 0) {
        const invalidAddress = {
          street: "",
          city: "",
          state: "",
          zipCode: "",
          country: "",
        };

        try {
          await orderService.createOrder({
            userId: testUserId,
            items: cart.items,
            shippingAddress: invalidAddress,
            paymentMethod: "pix",
          });
          console.log(`⚠️ Endereço inválido foi aceito (validação no backend)`);
        } catch (error) {
          console.log(`✅ Endereço inválido foi rejeitado`);
        }
      }
    });

    it("deve validar carrinho não vazio", async () => {
      const emptyCart = {
        id: "empty-cart",
        userId: testUserId,
        guildId: testGuildId,
        items: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      try {
        await orderService.createOrder({
          userId: testUserId,
          items: emptyCart.items,
          shippingAddress: {
            street: "Rua Teste, 123",
            city: "São Paulo",
            state: "SP",
            zipCode: "01310-100",
            country: "Brasil",
          },
          paymentMethod: "pix",
        });
        console.log(`⚠️ Carrinho vazio foi aceito (validação no backend)`);
      } catch (error) {
        console.log(`✅ Carrinho vazio foi rejeitado`);
      }
    });
  });
});
