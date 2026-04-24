import { eq, and } from "drizzle-orm";
import { CartItem } from "../../domain/entities/Cart";
import { ICartRepository } from "../../domain/repositories/ICartRepository";
import { cartItems as cartItemsTable } from "../../../drizzle/schema";
import { getDb } from "../../db";

export class CartRepository implements ICartRepository {
  async findByUserId(userId: number): Promise<CartItem[]> {
    const db = await getDb();
    if (!db) return [];

    const results = await db
      .select()
      .from(cartItemsTable)
      .where(eq(cartItemsTable.userId, userId));

    return results.map((r) => this.mapToEntity(r));
  }

  async findByUserAndProduct(
    userId: number,
    productId: number
  ): Promise<CartItem | null> {
    const db = await getDb();
    if (!db) return null;

    const result = await db
      .select()
      .from(cartItemsTable)
      .where(
        and(
          eq(cartItemsTable.userId, userId),
          eq(cartItemsTable.productId, productId)
        )
      )
      .limit(1);

    return result.length > 0 ? this.mapToEntity(result[0]) : null;
  }

  async create(cartItem: CartItem): Promise<CartItem> {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    await db.insert(cartItemsTable).values({
      userId: cartItem.userId,
      productId: cartItem.productId,
      quantity: cartItem.quantity,
    });

    // Fetch the created item
    const created = await db
      .select()
      .from(cartItemsTable)
      .where(
        and(
          eq(cartItemsTable.userId, cartItem.userId),
          eq(cartItemsTable.productId, cartItem.productId)
        )
      )
      .limit(1);

    if (created.length > 0) {
      cartItem.id = created[0].id;
    }

    return cartItem;
  }

  async update(cartItem: CartItem): Promise<CartItem> {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    await db
      .update(cartItemsTable)
      .set({
        quantity: cartItem.quantity,
        updatedAt: new Date(),
      })
      .where(eq(cartItemsTable.id, cartItem.id));

    return cartItem;
  }

  async delete(id: number): Promise<void> {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    await db.delete(cartItemsTable).where(eq(cartItemsTable.id, id));
  }

  async deleteByUserId(userId: number): Promise<void> {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    await db
      .delete(cartItemsTable)
      .where(eq(cartItemsTable.userId, userId));
  }

  async deleteByUserAndProduct(userId: number, productId: number): Promise<void> {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    await db
      .delete(cartItemsTable)
      .where(
        and(
          eq(cartItemsTable.userId, userId),
          eq(cartItemsTable.productId, productId)
        )
      );
  }

  private mapToEntity(row: any): CartItem {
    return new CartItem(
      row.id,
      row.userId,
      row.productId,
      row.quantity,
      row.createdAt,
      row.updatedAt
    );
  }
}
