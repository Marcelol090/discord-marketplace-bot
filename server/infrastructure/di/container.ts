import { container } from "tsyringe";
import { ProductService } from "../../domain/services/ProductService";
import { CategoryService } from "../../domain/services/CategoryService";
import { OrderService } from "../../domain/services/OrderService";
import { CartService } from "../../domain/services/CartService";
import { IProductRepository } from "../../domain/repositories/IProductRepository";
import { ICategoryRepository } from "../../domain/repositories/ICategoryRepository";
import { IOrderRepository } from "../../domain/repositories/IOrderRepository";
import { ICartRepository } from "../../domain/repositories/ICartRepository";
import { ProductRepository } from "../repositories/ProductRepository";
import { CategoryRepository } from "../repositories/CategoryRepository";
import { OrderRepository } from "../repositories/OrderRepository";
import { CartRepository } from "../repositories/CartRepository";

/**
 * Configure dependency injection container
 */
export function setupDependencyInjection(): void {
  // Register repositories
  container.register<IProductRepository>("IProductRepository", {
    useClass: ProductRepository,
  });

  container.register<ICategoryRepository>("ICategoryRepository", {
    useClass: CategoryRepository,
  });

  container.register<IOrderRepository>("IOrderRepository", {
    useClass: OrderRepository,
  });

  container.register<ICartRepository>("ICartRepository", {
    useClass: CartRepository,
  });

  // Register services
  container.registerSingleton(ProductService);
  container.registerSingleton(CategoryService);
  container.registerSingleton(OrderService);
  container.registerSingleton(CartService);
}

export { container };
