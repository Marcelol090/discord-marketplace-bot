import { injectable, inject } from "tsyringe";
import { Cart, CartItem } from "../entities/Cart";
import { ICartRepository } from "../repositories/ICartRepository";
import { IProductRepository } from "../repositories/IProductRepository";

@injectable()
export class CartService {
  constructor(
    @inject("ICartRepository") private cartRepository: ICartRepository,
    @inject("IProductRepository") private productRepository: IProductRepository
  ) {}

  async getCart(userId: number): Promise<Cart> {
    const cart = new Cart(userId);
    const items = await this.cartRepository.findByUserId(userId);
    items.forEach((item) => cart.addItem(item));
    return cart;
  }

  async addToCart(
    userId: number,
    productId: number,
    quantity: number = 1
  ): Promise<CartItem> {
    // Verify product exists and is in stock
    const product = await this.productRepository.findById(productId);
    if (!product) {
      throw new Error("Product not found");
    }

    if (!product.canPurchase(quantity)) {
      throw new Error("Insufficient stock");
    }

    // Check if item already in cart
    const existingItem = await this.cartRepository.findByUserAndProduct(
      userId,
      productId
    );

    if (existingItem) {
      existingItem.updateQuantity(existingItem.quantity + quantity);
      return this.cartRepository.update(existingItem);
    }

    const cartItem = CartItem.create({ userId, productId, quantity });
    return this.cartRepository.create(cartItem);
  }

  async removeFromCart(userId: number, productId: number): Promise<void> {
    return this.cartRepository.deleteByUserAndProduct(userId, productId);
  }

  async updateCartItemQuantity(
    userId: number,
    productId: number,
    quantity: number
  ): Promise<CartItem> {
    const item = await this.cartRepository.findByUserAndProduct(
      userId,
      productId
    );

    if (!item) {
      throw new Error("Item not found in cart");
    }

    // Verify product can be purchased with new quantity
    const product = await this.productRepository.findById(productId);
    if (!product || !product.canPurchase(quantity)) {
      throw new Error("Insufficient stock for requested quantity");
    }

    item.updateQuantity(quantity);
    return this.cartRepository.update(item);
  }

  async clearCart(userId: number): Promise<void> {
    return this.cartRepository.deleteByUserId(userId);
  }

  async getCartTotal(userId: number): Promise<string> {
    const items = await this.cartRepository.findByUserId(userId);
    let total = 0;

    for (const item of items) {
      const product = await this.productRepository.findById(item.productId);
      if (product) {
        total += parseFloat(product.price) * item.quantity;
      }
    }

    return total.toFixed(2);
  }
}
