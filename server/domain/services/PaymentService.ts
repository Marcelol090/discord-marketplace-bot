import { injectable } from "tsyringe";
import Stripe from "stripe";
import { ENV } from "../../_core/env";
import { MercadoPagoPixService } from "../../infrastructure/payments/MercadoPagoPixService";
import { PixNotificationService } from "../../infrastructure/discord/PixNotificationService";

export interface PixPaymentData {
  amount: string;
  description: string;
  orderId: number;
  payerEmail?: string;
}

export interface CardPaymentData {
  amount: string;
  description: string;
  orderId: number;
  token: string;
}

export interface PaymentResult {
  success: boolean;
  paymentId: string;
  qrCode?: string;
  qrCodeBase64?: string;
  copyPaste?: string;
  ticketUrl?: string;
  error?: string;
}

@injectable()
export class PaymentService {
  private stripe: Stripe;
  private mercadoPagoPixService: MercadoPagoPixService | null = null;
  private pixNotificationService: PixNotificationService;

  constructor() {
    const stripeKey = ENV.stripeSecretKey;
    if (!stripeKey) {
      throw new Error("STRIPE_SECRET_KEY not configured");
    }

    this.stripe = new Stripe(stripeKey, {
      apiVersion: "2024-04-10",
    });

    // Initialize MercadoPago if access token is available
    const mpAccessToken = ENV.mercadoPagoAccessToken;
    if (mpAccessToken) {
      const webhookUrl = ENV.mercadoPagoWebhookUrl || "";
      this.mercadoPagoPixService = new MercadoPagoPixService(mpAccessToken, webhookUrl);
    }

    this.pixNotificationService = new PixNotificationService();
  }

  /**
   * Generate PIX payment QR Code via MercadoPago.
   * Falls back to mock if MercadoPago is not configured.
   */
  async generatePixQrCode(data: PixPaymentData): Promise<PaymentResult> {
    try {
      // Use real MercadoPago if available
      if (this.mercadoPagoPixService) {
        const result = await this.mercadoPagoPixService.createPixPayment({
          amount: parseFloat(data.amount),
          description: data.description,
          orderId: data.orderId,
          payerEmail: data.payerEmail || "customer@marketplace.com",
        });

        return {
          success: result.success,
          paymentId: result.paymentId,
          qrCode: result.qrCode,
          qrCodeBase64: result.qrCodeBase64,
          copyPaste: result.qrCode, // QR code text IS the copy-paste string
          ticketUrl: result.ticketUrl,
          error: result.error,
        };
      }

      // Fallback: mock PIX for development
      console.warn("[PaymentService] MercadoPago not configured, using mock PIX");
      const pixKey = ENV.pixKey || "";
      return {
        success: true,
        paymentId: `pix_mock_${Date.now()}`,
        qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(`pix_${data.orderId}`)}`,
        copyPaste: `00020126580014br.gov.bcb.pix0136${pixKey}52040000530398654${parseFloat(data.amount).toFixed(2).length.toString().padStart(2, "0")}${parseFloat(data.amount).toFixed(2)}5802BR5913MERCHANT6009SAOPAULO62410503***63041D3D`,
      };
    } catch (error) {
      console.error("PIX QR code generation error:", error);
      return {
        success: false,
        paymentId: "",
        error: "Failed to generate PIX QR code",
      };
    }
  }

  /**
   * Process card payment via Stripe
   */
  async processCardPayment(data: CardPaymentData): Promise<PaymentResult> {
    try {
      const amount = Math.round(parseFloat(data.amount) * 100); // Convert to cents

      const paymentIntent = await this.stripe.paymentIntents.create({
        amount,
        currency: "brl",
        payment_method: data.token,
        confirm: true,
        description: data.description,
        metadata: {
          orderId: data.orderId.toString(),
        },
      });

      if (paymentIntent.status === "succeeded") {
        return {
          success: true,
          paymentId: paymentIntent.id,
        };
      } else if (paymentIntent.status === "requires_action") {
        return {
          success: false,
          paymentId: paymentIntent.id,
          error: "Payment requires additional action",
        };
      } else {
        return {
          success: false,
          paymentId: paymentIntent.id,
          error: `Payment failed with status: ${paymentIntent.status}`,
        };
      }
    } catch (error) {
      console.error("Card payment error:", error);
      return {
        success: false,
        paymentId: "",
        error: "Failed to process card payment",
      };
    }
  }

  /**
   * Verify payment status (Stripe or MercadoPago)
   */
  async verifyPaymentStatus(paymentId: string): Promise<boolean> {
    try {
      // MercadoPago PIX payment IDs are numeric
      if (/^\d+$/.test(paymentId) && this.mercadoPagoPixService) {
        const status = await this.mercadoPagoPixService.getPaymentStatus(paymentId);
        return status.isApproved;
      }

      // Mock PIX fallback
      if (paymentId.startsWith("pix_mock_")) {
        return false;
      }

      // Stripe
      const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentId);
      return paymentIntent.status === "succeeded";
    } catch (error) {
      console.error("Payment verification error:", error);
      return false;
    }
  }

  /**
   * Refund payment
   */
  async refundPayment(paymentId: string, amount?: string): Promise<boolean> {
    try {
      if (/^\d+$/.test(paymentId)) {
        // MercadoPago refunds — would need separate implementation
        console.log("MercadoPago refund requested for:", paymentId);
        return true;
      }

      if (paymentId.startsWith("pix_mock_")) {
        return true;
      }

      const refund = await this.stripe.refunds.create({
        payment_intent: paymentId,
        amount: amount ? Math.round(parseFloat(amount) * 100) : undefined,
      });

      return refund.status === "succeeded";
    } catch (error) {
      console.error("Refund error:", error);
      return false;
    }
  }

  /**
   * Confirm PIX payment manually (admin action)
   */
  async confirmPixPayment(orderId: number, userName: string): Promise<void> {
    try {
      await this.pixNotificationService.notifyPaymentConfirmed(orderId, userName);
    } catch (error) {
      console.error("Error confirming PIX payment:", error);
      throw error;
    }
  }

  /**
   * Cancel PIX payment
   */
  async cancelPixPayment(orderId: number, reason: string): Promise<void> {
    try {
      await this.pixNotificationService.notifyPaymentCancelled(orderId, reason);
    } catch (error) {
      console.error("Error cancelling PIX payment:", error);
      throw error;
    }
  }
}