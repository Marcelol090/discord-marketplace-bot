import { Order, OrderStatus } from "../entities/Order";

export interface IOrderRepository {
  findById(id: number): Promise<Order | null>;
  findByUserId(userId: number): Promise<Order[]>;
  findByDiscordUserId(discordUserId: string): Promise<Order[]>;
  findByStatus(status: OrderStatus): Promise<Order[]>;
  findAll(): Promise<Order[]>;
  create(order: Order): Promise<Order>;
  update(order: Order): Promise<Order>;
  delete(id: number): Promise<void>;
}
