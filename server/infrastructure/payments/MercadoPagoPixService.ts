import { MercadoPagoConfig, Payment } from "mercadopago";

export interface PixPaymentRequest {
  amount: number;
  description: string;
  orderId: number;
  payerEmail: string;
  payerFirstName?: string;
  payerLastName?: string;
  payerCpf?: string;
}

export interface PixPaymentResult {
  success: boolean;
  paymentId: string;
  qrCode?: string;
  qrCodeBase64?: string;
  ticketUrl?: string;
  error?: string;
}

export interface PixPaymentStatus {
  status: string;
  statusDetail: string;
  isApproved: boolean;
}

/**
 * MercadoPago PIX payment service.
 * Uses the official MercadoPago Node.js SDK to create PIX payments
 * and retrieve QR codes for instant payment.
 */
export class MercadoPagoPixService {
  private payment: InstanceType<typeof Payment>;
  private notificationUrl: string;

  constructor(accessToken: string, notificationUrl: string) {
    const client = new MercadoPagoConfig({
      accessToken,
      options: { timeout: 10000 },
    });

    this.payment = new Payment(client);
    this.notificationUrl = notificationUrl;
  }

  /**
   * Create a PIX payment and return QR code data.
   * The QR code is valid for 30 minutes by default.
   */
  async createPixPayment(request: PixPaymentRequest): Promise<PixPaymentResult> {
    try {
      const response = await this.payment.create({
        body: {
          transaction_amount: request.amount,
          description: request.description,
          payment_method_id: "pix",
          payer: {
            email: request.payerEmail,
            first_name: request.payerFirstName,
            last_name: request.payerLastName,
            identification: request.payerCpf
              ? { type: "CPF", number: request.payerCpf }
              : undefined,
          },
          external_reference: `order-${request.orderId}`,
          notification_url: this.notificationUrl,
        },
        requestOptions: {
          idempotencyKey: `pix-${request.orderId}-${Date.now()}`,
        },
      });

      const transactionData = (response as any).point_of_interaction?.transaction_data;

      return {
        success: true,
        paymentId: String(response.id),
        qrCode: transactionData?.qr_code,
        qrCodeBase64: transactionData?.qr_code_base64,
        ticketUrl: transactionData?.ticket_url,
      };
    } catch (error: any) {
      console.error("MercadoPago PIX error:", error);
      return {
        success: false,
        paymentId: "",
        error: error.message || "Failed to create PIX payment",
      };
    }
  }

  /**
   * Check payment status by MercadoPago payment ID.
   */
  async getPaymentStatus(paymentId: string): Promise<PixPaymentStatus> {
    try {
      const response = await this.payment.get({
        id: paymentId,
      });

      return {
        status: response.status || "unknown",
        statusDetail: (response as any).status_detail || "",
        isApproved: response.status === "approved",
      };
    } catch (error: any) {
      console.error("MercadoPago status check error:", error);
      return {
        status: "error",
        statusDetail: error.message,
        isApproved: false,
      };
    }
  }
}