/**
 * Order Entity - Represents a customer order
 */
export type OrderStatus =
  | "pending"
  | "paid"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";
export type PaymentMethod = "pix" | "credit_card";
export type DeliveryStatus = "pending" | "sent" | "failed";

export interface ShippingAddress {
  street: string;
  number: string;
  complement?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export class Order {
  constructor(
    public id: number,
    public userId: number,
    public discordUserId: string,
    public status: OrderStatus,
    public totalAmount: string,
    public paymentMethod: PaymentMethod,
    public paymentId: string | null,
    public trackingNumber: string | null,
    public shippingAddress: ShippingAddress | null,
    public notes: string | null,
    public createdAt: Date,
    public updatedAt: Date,
    public deliveryStatus: DeliveryStatus = "pending",
    public deliveryAttempts: number = 0,
    public lastDeliveryAttempt: Date | null = null
  ) {}

  static create(data: {
    userId: number;
    discordUserId: string;
    totalAmount: string;
    paymentMethod: PaymentMethod;
    shippingAddress?: ShippingAddress | null;
    notes?: string | null;
  }): Order {
    return new Order(
      0,
      data.userId,
      data.discordUserId,
      "pending",
      data.totalAmount,
      data.paymentMethod,
      null,
      null,
      data.shippingAddress || null,
      data.notes || null,
      new Date(),
      new Date(),
      "pending",
      0,
      null
    );
  }

  markDeliveryAsSent(): void {
    this.deliveryStatus = "sent";
    this.deliveryAttempts += 1;
    this.lastDeliveryAttempt = new Date();
    this.updatedAt = new Date();
  }

  markDeliveryAsFailed(): void {
    this.deliveryStatus = "failed";
    this.deliveryAttempts += 1;
    this.lastDeliveryAttempt = new Date();
    this.updatedAt = new Date();
  }

  resetDeliveryStatus(): void {
    this.deliveryStatus = "pending";
    this.updatedAt = new Date();
  }

  markAsPaid(paymentId: string): void {
    this.status = "paid";
    this.paymentId = paymentId;
    this.updatedAt = new Date();
  }

  markAsProcessing(): void {
    if (this.status !== "paid") {
      throw new Error("Order must be paid before processing");
    }
    this.status = "processing";
    this.updatedAt = new Date();
  }

  markAsShipped(trackingNumber: string): void {
    if (this.status !== "processing") {
      throw new Error("Order must be processing before shipping");
    }
    this.status = "shipped";
    this.trackingNumber = trackingNumber;
    this.updatedAt = new Date();
  }

  markAsDelivered(): void {
    if (this.status !== "shipped") {
      throw new Error("Order must be shipped before delivery");
    }
    this.status = "delivered";
    this.updatedAt = new Date();
  }

  cancel(): void {
    if (["delivered", "cancelled"].includes(this.status)) {
      throw new Error("Cannot cancel delivered or already cancelled orders");
    }
    this.status = "cancelled";
    this.updatedAt = new Date();
  }

  canBeCancelled(): boolean {
    return !["delivered", "cancelled"].includes(this.status);
  }
}
