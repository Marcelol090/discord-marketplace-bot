import { Router, Request, Response } from "express";
import Stripe from "stripe";
import { container } from "../di/container";
import { OrderService } from "../../domain/services/OrderService";
import { PaymentService } from "../../domain/services/PaymentService";
import { DigitalDeliveryService } from "../discord/DigitalDeliveryService";
import { ENV } from "../../_core/env";
import { getDb } from "../../db";
import { orders, orderItems, products } from "../../../drizzle/schema";
import { eq } from "drizzle-orm";

const router = Router();
const orderService = container.resolve(OrderService);
const paymentService = container.resolve(PaymentService);
const digitalDeliveryService = new DigitalDeliveryService();

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
          const orderId = parseInt(paymentIntent.metadata.orderId);
          await orderService.markOrderAsPaid(orderId, paymentIntent.id);
          
          // Trigger automatic digital delivery
          await triggerDigitalDelivery(orderId, "credit_card");
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
    
    // Trigger automatic digital delivery
    await triggerDigitalDelivery(orderId, "pix");

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
    
    // Trigger automatic digital delivery
    await triggerDigitalDelivery(orderId, "pix");

    res.json({ success: true, message: "Order marked as paid" });
  } catch (error) {
    console.error("Manual confirm error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * Trigger automatic digital delivery for order items
 */
async function triggerDigitalDelivery(orderId: number, paymentMethod: "pix" | "credit_card") {
  try {
    // Get order details
    const db = await getDb();
    if (!db) {
      console.error("Database not available");
      return;
    }

    const order = await db
      .select()
      .from(orders)
      .where(eq(orders.id, orderId))
      .limit(1);

    if (!order || order.length === 0) {
      console.error(`Order ${orderId} not found`);
      return;
    }

    const orderData = order[0];

    // Get order items
    const items = await db
      .select()
      .from(orderItems)
      .where(eq(orderItems.orderId, orderId));

    if (items.length === 0) {
      console.log(`No items found for order ${orderId}`);
      return;
    }

    // Get product details for each item
    const digitalItems = await Promise.all(
      items.map(async (item: any) => {
        const productList = await db
          .select()
          .from(products)
          .where(eq(products.id, item.productId))
          .limit(1);

        if (productList.length === 0) return null;

        const product = productList[0];

        // Only deliver digital products
        if (!product.isDigital || !product.assetKey) {
          return null;
        }

        return {
          name: product.name,
          assetKey: product.assetKey,
        };
      })
    );

    const validItems = digitalItems.filter((item: any) => item !== null) as Array<{
      name: string;
      assetKey: string;
    }>;

    if (validItems.length === 0) {
      console.log(`No digital items to deliver for order ${orderId}`);
      return;
    }

    // Send order confirmation notification
    await digitalDeliveryService.notifyOrderConfirmed(
      orderData.discordUserId,
      orderId,
      parseFloat(orderData.totalAmount.toString()),
      paymentMethod
    );

    // Deliver digital assets
    const deliverySuccess = await digitalDeliveryService.deliverMultipleAssets(
      orderData.discordUserId,
      validItems,
      orderId
    );

    // Update delivery status in database
    if (deliverySuccess) {
      await db
        .update(orders)
        .set({
          deliveryStatus: "sent",
          deliveryAttempts: (orderData.deliveryAttempts || 0) + 1,
          lastDeliveryAttempt: new Date(),
        })
        .where(eq(orders.id, orderId));

      console.log(`✅ Digital delivery completed for order ${orderId}`);
    } else {
      // Mark as failed but increment attempts
      await db
        .update(orders)
        .set({
          deliveryStatus: "failed",
          deliveryAttempts: (orderData.deliveryAttempts || 0) + 1,
          lastDeliveryAttempt: new Date(),
        })
        .where(eq(orders.id, orderId));

      console.error(`❌ Digital delivery failed for order ${orderId}`);
    }
  } catch (error) {
    console.error("Error triggering digital delivery:", error);
  }
}

export default router;
