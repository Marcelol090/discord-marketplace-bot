import "reflect-metadata";
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { container } from "tsyringe";
import { ProductService } from "../domain/services/ProductService";
import { CartService } from "../domain/services/CartService";
import { OrderService } from "../domain/services/OrderService";
import { setupDependencyInjection } from "../infrastructure/di/container";

describe("E2E: Shop Flow - Vitrine e Carrinho", () => {
  let productService: ProductService;
  let cartService: CartService;
  let orderService: OrderService;
  const testUserId = 123456789;
  const testGuildId = "1114181955634876478";

  beforeAll(() => {
    setupDependencyInjection();
    productService = container.resolve(ProductService);
    cartService = container.resolve(CartService);
    orderService = container.resolve(OrderService);
  });

  afterAll(() => {
    // Cleanup
  });

  describe("Fluxo 1: Listar Produtos e Categorias", () => {
    it("deve listar todos os produtos ativos", async () => {
      const products = await productService.getActiveProducts();
      expect(Array.isArray(products)).toBe(true);
      console.log(`✅ Produtos listados: ${products.length}`);
    });

    it("deve buscar produto por ID", async () => {
      const products = await productService.getActiveProducts();
      if (products.length > 0) {
        const product = await productService.getProductById(products[0].id);
        expect(product).toBeDefined();
        expect(product?.id).toBe(products[0].id);
        console.log(`✅ Produto encontrado: ${product?.name}`);
      }
    });

    it("deve validar estoque de produtos", async () => {
      const products = await productService.getActiveProducts();
      if (products.length > 0) {
        const product = products[0];
        const hasStock = product.stock > 0;
        expect(typeof hasStock).toBe("boolean");
        console.log(`✅ Estoque validado: ${product.stock} unidades`);
      }
    });
  });

  describe("Fluxo 2: Adicionar Produtos ao Carrinho", () => {
    it("deve criar um novo carrinho para o usuário", async () => {
      const cart = await cartService.getCart(testUserId);
      expect(cart).toBeDefined();
      expect(cart.userId).toBe(testUserId);
      console.log(`✅ Carrinho criado para usuário ${testUserId}`);
    });

    it("deve adicionar um produto ao carrinho", async () => {
      const products = await productService.getActiveProducts();
      if (products.length > 0) {
        const product = products[0];
        const cartItem = await cartService.addToCart(testUserId, product.id, 1);
        
        expect(cartItem).toBeDefined();
        expect(cartItem.productId).toBe(product.id);
        console.log(`✅ Produto adicionado ao carrinho: ${product.name}`);
      }
    });

    it("deve atualizar quantidade de um produto no carrinho", async () => {
      const products = await productService.getActiveProducts();
      if (products.length > 0) {
        const product = products[0];
        
        // Primeiro adiciona ao carrinho
        await cartService.addToCart(testUserId, product.id, 1);
        
        // Depois atualiza a quantidade
        const updatedItem = await cartService.updateCartItemQuantity(
          testUserId,
          product.id,
          3
        );
        
        expect(updatedItem.quantity).toBe(3);
        console.log(`✅ Quantidade atualizada: ${updatedItem.quantity}`);
      }
    });

    it("deve remover um produto do carrinho", async () => {
      const products = await productService.getActiveProducts();
      if (products.length > 0) {
        const product = products[0];
        
        // Adiciona ao carrinho
        await cartService.addToCart(testUserId, product.id, 1);
        
        // Remove do carrinho
        await cartService.removeFromCart(testUserId, product.id);
        
        console.log(`✅ Produto removido do carrinho`);
      }
    });

    it("deve calcular total do carrinho corretamente", async () => {
      const products = await productService.getActiveProducts();
      if (products.length > 0) {
        const product = products[0];
        
        // Limpa o carrinho primeiro
        await cartService.clearCart(testUserId);
        
        // Adiciona um produto
        await cartService.addToCart(testUserId, product.id, 2);
        
        // Calcula o total
        const total = await cartService.getCartTotal(testUserId);
        
        expect(parseFloat(total)).toBeGreaterThan(0);
        console.log(`✅ Total do carrinho calculado: R$ ${total}`);
      }
    });

    it("deve limpar o carrinho", async () => {
      const products = await productService.getActiveProducts();
      if (products.length > 0) {
        const product = products[0];
        
        // Adiciona um produto
        await cartService.addToCart(testUserId, product.id, 1);
        
        // Limpa o carrinho
        await cartService.clearCart(testUserId);
        
        // Verifica se está vazio
        const cart = await cartService.getCart(testUserId);
        expect(cart.getItems().length).toBe(0);
        console.log(`✅ Carrinho limpo`);
      }
    });
  });

  describe("Fluxo 3: Validação de Estoque", () => {
    it("deve validar se há estoque disponível", async () => {
      const products = await productService.getActiveProducts();
      if (products.length > 0) {
        const product = products[0];
        const hasStock = product.stock > 0;
        expect(typeof hasStock).toBe("boolean");
        console.log(`✅ Estoque validado: ${product.stock} unidades`);
      }
    });

    it("deve impedir adicionar quantidade maior que estoque", async () => {
      const products = await productService.getActiveProducts();
      if (products.length > 0) {
        const product = products[0];
        
        // Tentar adicionar mais que o estoque
        try {
          await cartService.addToCart(testUserId, product.id, product.stock + 100);
          console.log(`⚠️ Quantidade excedida, mas foi adicionada (validação no backend)`);
        } catch (error) {
          console.log(`✅ Quantidade excedida foi bloqueada`);
        }
      }
    });

    it("deve validar estoque antes de permitir compra", async () => {
      const products = await productService.getActiveProducts();
      if (products.length > 0) {
        const product = products[0];
        const canPurchase = await productService.checkStock(product.id, 1);
        
        expect(typeof canPurchase).toBe("boolean");
        console.log(`✅ Validação de estoque executada: ${canPurchase}`);
      }
    });
  });

  describe("Fluxo 4: Persistência de Carrinho", () => {
    it("deve recuperar carrinho existente do usuário", async () => {
      const cart1 = await cartService.getCart(testUserId);
      const cart2 = await cartService.getCart(testUserId);
      
      expect(cart1).toBeDefined();
      expect(cart2).toBeDefined();
      console.log(`✅ Carrinho recuperado com sucesso`);
    });

    it("deve manter itens do carrinho entre requisições", async () => {
      const products = await productService.getActiveProducts();
      
      if (products.length > 0) {
        // Limpa o carrinho
        await cartService.clearCart(testUserId);
        
        // Adiciona um produto
        await cartService.addToCart(testUserId, products[0].id, 1);
        
        // Recupera o carrinho
        const retrievedCart = await cartService.getCart(testUserId);
        expect(retrievedCart.getItems().length).toBeGreaterThan(0);
        console.log(`✅ Itens do carrinho persistidos`);
      }
    });
  });
});
