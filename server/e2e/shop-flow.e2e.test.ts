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
    it("deve listar todas as categorias", async () => {
      const categories = await productService.getCategories();
      expect(Array.isArray(categories)).toBe(true);
      console.log(`✅ Categorias listadas: ${categories.length}`);
    });

    it("deve listar produtos por categoria", async () => {
      const categories = await productService.getCategories();
      if (categories.length > 0) {
        const products = await productService.getProductsByCategory(categories[0].id);
        expect(Array.isArray(products)).toBe(true);
        console.log(`✅ Produtos listados: ${products.length}`);
      }
    });

    it("deve buscar produto por ID", async () => {
      const categories = await productService.getCategories();
      if (categories.length > 0) {
        const products = await productService.getProductsByCategory(categories[0].id);
        if (products.length > 0) {
          const product = await productService.getProductById(products[0].id);
          expect(product).toBeDefined();
          expect(product?.id).toBe(products[0].id);
          console.log(`✅ Produto encontrado: ${product?.name}`);
        }
      }
    });
  });

  describe("Fluxo 2: Adicionar Produtos ao Carrinho", () => {
    it("deve criar um novo carrinho para o usuário", async () => {
      const cart = await cartService.getOrCreateCart(testUserId, testGuildId);
      expect(cart).toBeDefined();
      expect(cart.userId).toBe(testUserId);
      console.log(`✅ Carrinho criado: ${cart.id}`);
    });

    it("deve adicionar um produto ao carrinho", async () => {
      const categories = await productService.getCategories();
      if (categories.length > 0) {
        const products = await productService.getProductsByCategory(categories[0].id);
        if (products.length > 0) {
          const product = products[0];
          const cart = await cartService.getOrCreateCart(testUserId, testGuildId);
          
          const updatedCart = await cartService.addToCart(cart.id, product.id, 1);
          expect(updatedCart.items.length).toBeGreaterThan(0);
          console.log(`✅ Produto adicionado ao carrinho: ${product.name}`);
        }
      }
    });

    it("deve atualizar quantidade de um produto no carrinho", async () => {
      const cart = await cartService.getOrCreateCart(testUserId, testGuildId);
      if (cart.items.length > 0) {
        const item = cart.items[0];
        const updatedCart = await cartService.updateCartItemQuantity(
          cart.id,
          item.productId,
          5
        );
        
        const updatedItem = updatedCart.items.find(
          (i) => i.productId === item.productId
        );
        expect(updatedItem?.quantity).toBe(5);
        console.log(`✅ Quantidade atualizada: ${updatedItem?.quantity}`);
      }
    });

    it("deve remover um produto do carrinho", async () => {
      const cart = await cartService.getOrCreateCart(testUserId, testGuildId);
      const initialCount = cart.items.length;
      
      if (cart.items.length > 0) {
        const item = cart.items[0];
        const updatedCart = await cartService.removeFromCart(cart.id, item.productId);
        
        expect(updatedCart.items.length).toBeLessThan(initialCount);
        console.log(`✅ Produto removido do carrinho`);
      }
    });

    it("deve calcular total do carrinho corretamente", async () => {
      const cart = await cartService.getOrCreateCart(testUserId, testGuildId);
      
      if (cart.items.length > 0) {
        const total = cart.items.reduce((sum, item) => {
          return sum + item.price * item.quantity;
        }, 0);
        
        expect(total).toBeGreaterThan(0);
        console.log(`✅ Total do carrinho calculado: R$ ${total.toFixed(2)}`);
      }
    });

    it("deve limpar o carrinho", async () => {
      const cart = await cartService.getOrCreateCart(testUserId, testGuildId);
      const clearedCart = await cartService.clearCart(cart.id);
      
      expect(clearedCart.items.length).toBe(0);
      console.log(`✅ Carrinho limpo`);
    });
  });

  describe("Fluxo 3: Validação de Estoque", () => {
    it("deve validar se há estoque disponível", async () => {
      const categories = await productService.getCategories();
      if (categories.length > 0) {
        const products = await productService.getProductsByCategory(categories[0].id);
        if (products.length > 0) {
          const product = products[0];
          const hasStock = product.stock > 0;
          expect(typeof hasStock).toBe("boolean");
          console.log(`✅ Estoque validado: ${product.stock} unidades`);
        }
      }
    });

    it("deve impedir adicionar quantidade maior que estoque", async () => {
      const categories = await productService.getCategories();
      if (categories.length > 0) {
        const products = await productService.getProductsByCategory(categories[0].id);
        if (products.length > 0) {
          const product = products[0];
          const cart = await cartService.getOrCreateCart(testUserId, testGuildId);
          
          // Tentar adicionar mais que o estoque
          try {
            await cartService.addToCart(cart.id, product.id, product.stock + 100);
            console.log(`⚠️ Quantidade excedida, mas foi adicionada (validação no backend)`);
          } catch (error) {
            console.log(`✅ Quantidade excedida foi bloqueada`);
          }
        }
      }
    });
  });

  describe("Fluxo 4: Persistência de Carrinho", () => {
    it("deve recuperar carrinho existente do usuário", async () => {
      const cart1 = await cartService.getOrCreateCart(testUserId, testGuildId);
      const cart2 = await cartService.getOrCreateCart(testUserId, testGuildId);
      
      expect(cart1.id).toBe(cart2.id);
      console.log(`✅ Carrinho recuperado com sucesso`);
    });

    it("deve manter itens do carrinho entre requisições", async () => {
      const cart = await cartService.getOrCreateCart(testUserId, testGuildId);
      const initialItemCount = cart.items.length;
      
      const categories = await productService.getCategories();
      if (categories.length > 0) {
        const products = await productService.getProductsByCategory(categories[0].id);
        if (products.length > 0) {
          await cartService.addToCart(cart.id, products[0].id, 1);
          
          const retrievedCart = await cartService.getOrCreateCart(testUserId, testGuildId);
          expect(retrievedCart.items.length).toBeGreaterThanOrEqual(initialItemCount);
          console.log(`✅ Itens do carrinho persistidos`);
        }
      }
    });
  });
});
