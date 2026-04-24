import { eq } from "drizzle-orm";
import { Order, OrderStatus } from "../../domain/entities/Order";
import { IOrderRepository } from "../../domain/repositories/IOrderRepository";
import { orders as ordersTable } from "../../../drizzle/schema";
import { getDb } from "../../db";

export class OrderRepository implements IOrderRepository {
  async findById(id: number): Promise<Order | null> {
    const db = await getDb();
    if (!db) return null;

    const result = await db
      .select()
      .from(ordersTable)
      .where(eq(ordersTable.id, id))
      .limit(1);

    return result.length > 0 ? this.mapToEntity(result[0]) : null;
  }

  async findByUserId(userId: number): Promise<Order[]> {
    const db = await getDb();
    if (!db) return [];

    const results = await db
      .select()
      .from(ordersTable)
      .where(eq(ordersTable.userId, userId));

    return results.map((r) => this.mapToEntity(r));
  }

  async findByDiscordUserId(discordUserId: string): Promise<Order[]> {
    const db = await getDb();
    if (!db) return [];

    const results = await db
      .select()
      .from(ordersTable)
      .where(eq(ordersTable.discordUserId, discordUserId));

    return results.map((r) => this.mapToEntity(r));
  }

  async findByStatus(status: OrderStatus): Promise<Order[]> {
    const db = await getDb();
    if (!db) return [];

    const results = await db
      .select()
      .from(ordersTable)
      .where(eq(ordersTable.status, status));

    return results.map((r) => this.mapToEntity(r));
  }

  async findAll(): Promise<Order[]> {
    const db = await getDb();
    if (!db) return [];

    const results = await db.select().from(ordersTable);
    return results.map((r) => this.mapToEntity(r));
  }

  async create(order: Order): Promise<Order> {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    await db.insert(ordersTable).values({
      userId: order.userId,
      discordUserId: order.discordUserId,
      status: order.status,
      totalAmount: order.totalAmount,
      paymentMethod: order.paymentMethod,
      paymentId: order.paymentId,
      trackingNumber: order.trackingNumber,
      shippingAddress: order.shippingAddress
        ? JSON.stringify(order.shippingAddress)
        : null,
      notes: order.notes,
    });

    // Fetch the created order
    const created = await db
      .select()
      .from(ordersTable)
      .where(eq(ordersTable.discordUserId, order.discordUserId))
      .orderBy((t) => t.id)
      .limit(1);

    if (created.length > 0) {
      order.id = created[0].id;
    }

    return order;
  }

  async update(order: Order): Promise<Order> {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    await db
      .update(ordersTable)
      .set({
        status: order.status,
        totalAmount: order.totalAmount,
        paymentMethod: order.paymentMethod,
        paymentId: order.paymentId,
        trackingNumber: order.trackingNumber,
        shippingAddress: order.shippingAddress
          ? JSON.stringify(order.shippingAddress)
          : null,
        notes: order.notes,
        updatedAt: new Date(),
      })
      .where(eq(ordersTable.id, order.id));

    return order;
  }

  async delete(id: number): Promise<void> {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    await db.delete(ordersTable).where(eq(ordersTable.id, id));
  }

  private mapToEntity(row: any): Order {
    return new Order(
      row.id,
      row.userId,
      row.discordUserId,
      row.status,
      row.totalAmount,
      row.paymentMethod,
      row.paymentId,
      row.trackingNumber,
      row.shippingAddress ? JSON.parse(row.shippingAddress) : null,
      row.notes,
      row.createdAt,
      row.updatedAt
    );
  }
}
