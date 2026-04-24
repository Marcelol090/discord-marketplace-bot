/**
 * Cart Item Entity - Represents an item in a shopping cart
 */
export class CartItem {
  constructor(
    public id: number,
    public userId: number,
    public productId: number,
    public quantity: number,
    public createdAt: Date,
    public updatedAt: Date
  ) {}

  static create(data: {
    userId: number;
    productId: number;
    quantity?: number;
  }): CartItem {
    return new CartItem(
      0,
      data.userId,
      data.productId,
      data.quantity || 1,
      new Date(),
      new Date()
    );
  }

  updateQuantity(quantity: number): void {
    if (quantity <= 0) {
      throw new Error("Quantity must be greater than 0");
    }
    this.quantity = quantity;
    this.updatedAt = new Date();
  }
}

/**
 * Shopping Cart - Aggregates cart items for a user
 */
export class Cart {
  private items: CartItem[] = [];

  constructor(public userId: number) {}

  addItem(item: CartItem): void {
    const existingItem = this.items.find((i) => i.productId === item.productId);
    if (existingItem) {
      existingItem.quantity += item.quantity;
      existingItem.updatedAt = new Date();
    } else {
      this.items.push(item);
    }
  }

  removeItem(productId: number): void {
    this.items = this.items.filter((i) => i.productId !== productId);
  }

  updateItemQuantity(productId: number, quantity: number): void {
    const item = this.items.find((i) => i.productId === productId);
    if (!item) {
      throw new Error("Item not found in cart");
    }
    item.updateQuantity(quantity);
  }

  getItems(): CartItem[] {
    return this.items;
  }

  clear(): void {
    this.items = [];
  }

  isEmpty(): boolean {
    return this.items.length === 0;
  }

  getTotalItems(): number {
    return this.items.reduce((total, item) => total + item.quantity, 0);
  }
}
