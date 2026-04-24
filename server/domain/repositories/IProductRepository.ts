import { Product } from "../entities/Product";

export interface IProductRepository {
  findById(id: number): Promise<Product | null>;
  findByCategory(categoryId: number): Promise<Product[]>;
  findAll(): Promise<Product[]>;
  findActive(): Promise<Product[]>;
  create(product: Product): Promise<Product>;
  update(product: Product): Promise<Product>;
  delete(id: number): Promise<void>;
  decreaseStock(id: number, quantity: number): Promise<void>;
  increaseStock(id: number, quantity: number): Promise<void>;
}
