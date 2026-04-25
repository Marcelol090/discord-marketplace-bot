import { Router, Request, Response } from "express";
import Stripe from "stripe";
import { container } from "../di/container";
import { OrderService } from "../../domain/services/OrderService";
import { PaymentService } from "../../domain/services/PaymentService";
import { ENV } from "../../_core/env";

const router = Router();
const orderService = container.resolve(OrderService);
const paymentService = container.resolve(PaymentService);

// Webhook secret do Stripe (deve ser configurado como variável de ambiente)
const stripeWebhookSecret = ENV.stripeWebhookSecret;

/**
 * POST /api/payment/stripe-webhook
 * Recebe eventos de pagamento do Stripe
 */
router.post("/stripe-webhook", async (req: Request, res: Response) => {
  try {
    const signature = req.headers["stripe-signature"] as string;

    if (!stripeWebhookSecret) {
      console.warn("STRIPE_WEBHOOK_SECRET not configured");
      return res.status(400).json({ error: "Webhook secret not configured" });
    }

    let event: Stripe.Event;

    try {
      const stripe = new Stripe(ENV.stripeSecretKey || "", {
        apiVersion: "2024-04-10",
      });

      event = stripe.webhooks.constructEvent(
        req.body,
        signature,
        stripeWebhookSecret
      );
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return res.status(400).send(`Webhook Error: ${err}`);
    }

    // Handle different event types
    switch (event.type) {
      case "payment_intent.succeeded":
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log("Payment succeeded:", paymentIntent.id);
        
        // Mark order as paid
        if (paymentIntent.metadata?.orderId) {
          await orderService.markOrderAsPaid(
            parseInt(paymentIntent.metadata.orderId),
            paymentIntent.id
          );
        }
        break;

      case "payment_intent.payment_failed":
        const failedIntent = event.data.object as Stripe.PaymentIntent;
        console.log("Payment failed:", failedIntent.id);
        
        // Log failed payment
        if (failedIntent.metadata?.orderId) {
          console.log("Order payment failed:", failedIntent.metadata.orderId);
        }
        break;

      case "charge.refunded":
        const refundedCharge = event.data.object as Stripe.Charge;
        console.log("Charge refunded:", refundedCharge.id);
        
        // Log refund
        if (refundedCharge.metadata?.orderId) {
          console.log("Order refunded:", refundedCharge.metadata.orderId);
        }
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error("Stripe webhook error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * POST /api/payment/pix-webhook
 * Recebe confirmações de pagamento PIX
 */
router.post("/pix-webhook", async (req: Request, res: Response) => {
  try {
    const { orderId, pixKey } = req.body;

    if (!orderId) {
      return res.status(400).json({ error: "Missing orderId" });
    }

    // Verify PIX key
    if (pixKey !== ENV.pixKey) {
      return res.status(401).json({ error: "Invalid PIX key" });
    }

    // Mark order as paid
    await orderService.markOrderAsPaid(orderId, `pix_${Date.now()}`);

    res.json({ success: true });
  } catch (error) {
    console.error("PIX webhook error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * POST /api/payment/manual-confirm
 * Confirmar pagamento PIX manualmente (para testes)
 */
router.post("/manual-confirm", async (req: Request, res: Response) => {
  try {
    const { orderId, pixKey } = req.body;

    if (!orderId) {
      return res.status(400).json({ error: "Missing orderId" });
    }

    // Verify PIX key
    if (pixKey !== ENV.pixKey) {
      return res.status(401).json({ error: "Invalid PIX key" });
    }

    // Mark order as paid
    await orderService.markOrderAsPaid(orderId, `pix_manual_${Date.now()}`);

    res.json({ success: true, message: "Order marked as paid" });
  } catch (error) {
    console.error("Manual confirm error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;

