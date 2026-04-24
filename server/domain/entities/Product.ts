/**
 * Product Entity - Represents a product in the marketplace
 */
export class Product {
  constructor(
    public id: number,
    public categoryId: number,
    public name: string,
    public description: string | null,
    public price: string, // Stored as decimal string from DB
    public stock: number,
    public imageUrl: string | null,
    public isActive: boolean,
    public createdAt: Date,
    public updatedAt: Date
  ) {}

  static create(data: {
    categoryId: number;
    name: string;
    description?: string | null;
    price: string;
    stock?: number;
    imageUrl?: string | null;
    isActive?: boolean;
  }): Product {
    return new Product(
      0,
      data.categoryId,
      data.name,
      data.description || null,
      data.price,
      data.stock || 0,
      data.imageUrl || null,
      data.isActive !== false,
      new Date(),
      new Date()
    );
  }

  canPurchase(quantity: number): boolean {
    return this.isActive && this.stock >= quantity;
  }

  decreaseStock(quantity: number): void {
    if (!this.canPurchase(quantity)) {
      throw new Error("Insufficient stock");
    }
    this.stock -= quantity;
  }

  increaseStock(quantity: number): void {
    this.stock += quantity;
  }
}
