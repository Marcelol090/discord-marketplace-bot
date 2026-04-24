import { injectable, inject } from "tsyringe";
import { Product } from "../entities/Product";
import { IProductRepository } from "../repositories/IProductRepository";

@injectable()
export class ProductService {
  constructor(
    @inject("IProductRepository") private productRepository: IProductRepository
  ) {}

  async getAllProducts(): Promise<Product[]> {
    return this.productRepository.findAll();
  }

  async getActiveProducts(): Promise<Product[]> {
    return this.productRepository.findActive();
  }

  async getProductsByCategory(categoryId: number): Promise<Product[]> {
    return this.productRepository.findByCategory(categoryId);
  }

  async getProductById(id: number): Promise<Product | null> {
    return this.productRepository.findById(id);
  }

  async createProduct(data: {
    categoryId: number;
    name: string;
    description?: string;
    price: string;
    stock?: number;
    imageUrl?: string;
  }): Promise<Product> {
    const product = Product.create(data);
    return this.productRepository.create(product);
  }

  async updateProduct(
    id: number,
    data: Partial<{
      categoryId: number;
      name: string;
      description: string;
      price: string;
      stock: number;
      imageUrl: string;
      isActive: boolean;
    }>
  ): Promise<Product> {
    const product = await this.productRepository.findById(id);
    if (!product) {
      throw new Error("Product not found");
    }

    Object.assign(product, data);
    return this.productRepository.update(product);
  }

  async deleteProduct(id: number): Promise<void> {
    return this.productRepository.delete(id);
  }

  async checkStock(productId: number, quantity: number): Promise<boolean> {
    const product = await this.productRepository.findById(productId);
    if (!product) {
      return false;
    }
    return product.canPurchase(quantity);
  }

  async decreaseStock(productId: number, quantity: number): Promise<void> {
    return this.productRepository.decreaseStock(productId, quantity);
  }

  async increaseStock(productId: number, quantity: number): Promise<void> {
    return this.productRepository.increaseStock(productId, quantity);
  }
}
