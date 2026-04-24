import { injectable, inject } from "tsyringe";
import { Order, OrderStatus, PaymentMethod, ShippingAddress } from "../entities/Order";
import { IOrderRepository } from "../repositories/IOrderRepository";

@injectable()
export class OrderService {
  constructor(
    @inject("IOrderRepository") private orderRepository: IOrderRepository
  ) {}

  async createOrder(data: {
    userId: number;
    discordUserId: string;
    totalAmount: string;
    paymentMethod: PaymentMethod;
    shippingAddress?: ShippingAddress;
    notes?: string;
  }): Promise<Order> {
    const order = Order.create(data);
    return this.orderRepository.create(order);
  }

  async getOrderById(id: number): Promise<Order | null> {
    return this.orderRepository.findById(id);
  }

  async getOrdersByUserId(userId: number): Promise<Order[]> {
    return this.orderRepository.findByUserId(userId);
  }

  async getOrdersByDiscordUserId(discordUserId: string): Promise<Order[]> {
    return this.orderRepository.findByDiscordUserId(discordUserId);
  }

  async getOrdersByStatus(status: OrderStatus): Promise<Order[]> {
    return this.orderRepository.findByStatus(status);
  }

  async getAllOrders(): Promise<Order[]> {
    return this.orderRepository.findAll();
  }

  async markOrderAsPaid(orderId: number, paymentId: string): Promise<Order> {
    const order = await this.orderRepository.findById(orderId);
    if (!order) {
      throw new Error("Order not found");
    }

    order.markAsPaid(paymentId);
    return this.orderRepository.update(order);
  }

  async markOrderAsProcessing(orderId: number): Promise<Order> {
    const order = await this.orderRepository.findById(orderId);
    if (!order) {
      throw new Error("Order not found");
    }

    order.markAsProcessing();
    return this.orderRepository.update(order);
  }

  async markOrderAsShipped(
    orderId: number,
    trackingNumber: string
  ): Promise<Order> {
    const order = await this.orderRepository.findById(orderId);
    if (!order) {
      throw new Error("Order not found");
    }

    order.markAsShipped(trackingNumber);
    return this.orderRepository.update(order);
  }

  async markOrderAsDelivered(orderId: number): Promise<Order> {
    const order = await this.orderRepository.findById(orderId);
    if (!order) {
      throw new Error("Order not found");
    }

    order.markAsDelivered();
    return this.orderRepository.update(order);
  }

  async cancelOrder(orderId: number): Promise<Order> {
    const order = await this.orderRepository.findById(orderId);
    if (!order) {
      throw new Error("Order not found");
    }

    order.cancel();
    return this.orderRepository.update(order);
  }

  async updateOrderNotes(orderId: number, notes: string): Promise<Order> {
    const order = await this.orderRepository.findById(orderId);
    if (!order) {
      throw new Error("Order not found");
    }

    order.notes = notes;
    return this.orderRepository.update(order);
  }
}
