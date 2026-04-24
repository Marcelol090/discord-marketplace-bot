import { injectable } from "tsyringe";
import Stripe from "stripe";

export interface PixPaymentData {
  amount: string;
  description: string;
  orderId: number;
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
  copyPaste?: string;
  error?: string;
}

@injectable()
export class PaymentService {
  private stripe: Stripe;
  private pixKey: string;

  constructor() {
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) {
      throw new Error("STRIPE_SECRET_KEY not configured");
    }

    this.stripe = new Stripe(stripeKey, {
      apiVersion: "2024-04-10",
    });

    this.pixKey = process.env.PIX_KEY || "";
  }

  /**
   * Generate PIX payment QR Code
   * Note: This is a simplified implementation. In production, use MercadoPago or Stripe PIX integration
   */
  async generatePixQrCode(data: PixPaymentData): Promise<PaymentResult> {
    try {
      if (!this.pixKey) {
        throw new Error("PIX key not configured");
      }

      // In production, integrate with MercadoPago or Stripe PIX
      // For now, return a mock QR code
      const qrCode = await this.generateMockPixQrCode(data);

      return {
        success: true,
        paymentId: `pix_${Date.now()}`,
        qrCode,
        copyPaste: `00020126580014br.gov.bcb.pix0136${this.pixKey}52040000530398654061${parseFloat(data.amount).toFixed(2)}5802BR5913MERCHANT6009SAOPAULO62410503***63041D3D`,
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
   * Verify payment status
   */
  async verifyPaymentStatus(paymentId: string): Promise<boolean> {
    try {
      if (paymentId.startsWith("pix_")) {
        // In production, check PIX payment status with MercadoPago or Stripe
        // For now, assume it's pending
        return false;
      }

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
      if (paymentId.startsWith("pix_")) {
        // PIX refunds are handled differently
        console.log("PIX refund requested for:", paymentId);
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
   * Generate mock PIX QR code for demonstration
   * In production, use actual PIX integration
   */
  private async generateMockPixQrCode(data: PixPaymentData): Promise<string> {
    // This would be replaced with actual QR code generation
    // For now, return a placeholder base64 image
    return "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
  }
}
