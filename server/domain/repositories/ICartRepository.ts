import { CartItem } from "../entities/Cart";

export interface ICartRepository {
  findByUserId(userId: number): Promise<CartItem[]>;
  findByUserAndProduct(userId: number, productId: number): Promise<CartItem | null>;
  create(cartItem: CartItem): Promise<CartItem>;
  update(cartItem: CartItem): Promise<CartItem>;
  delete(id: number): Promise<void>;
  deleteByUserId(userId: number): Promise<void>;
  deleteByUserAndProduct(userId: number, productId: number): Promise<void>;
}
