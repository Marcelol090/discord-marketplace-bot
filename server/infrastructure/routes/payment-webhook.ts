import { Router, Request, Response } from "express";
import { container } from "../di/container";
import { OrderService } from "../../domain/services/OrderService";
import { PaymentService } from "../../domain/services/PaymentService";
import Stripe from "stripe";

const router = Router();
const orderService = container.resolve(OrderService);
const paymentService = container.resolve(PaymentService);

// Webhook secret do Stripe (deve ser configurado como variável de ambiente)
const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";

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
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
        apiVersion: "2024-04-10",
      });

      event = stripe.webhooks.constructEvent((req as any).rawBody, signature, stripeWebhookSecret);
    } catch (error: any) {
      console.error("Webhook signature verification failed:", error.message);
      return res.status(400).json({ error: "Invalid signature" });
    }

    // Processar diferentes tipos de eventos
    switch (event.type) {
      case "payment_intent.succeeded":
        await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;

      case "payment_intent.payment_failed":
        await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent);
        break;

      case "charge.refunded":
        await handleChargeRefunded(event.data.object as Stripe.Charge);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error: any) {
    console.error("Stripe webhook error:", error);
    res.status(500).json({ error: "Webhook processing failed" });
  }
});

/**
 * POST /api/payment/pix-webhook
 * Recebe confirmações de pagamento PIX (para integração com MercadoPago/Stripe PIX)
 */
router.post("/pix-webhook", async (req: Request, res: Response) => {
  try {
    const { orderId, status, transactionId, amount } = req.body;

    if (!orderId || !status) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    console.log(`📱 PIX Webhook recebido - Pedido #${orderId}, Status: ${status}`);

    // Atualizar status do pedido
    if (status === "paid" || status === "confirmed") {
      // Confirmar pagamento
      await paymentService.confirmPixPayment(orderId, "PIX Payment Confirmed");

      // Atualizar pedido no banco de dados
      // await orderService.updateOrderStatus(orderId, "paid");

      console.log(`✅ Pedido #${orderId} marcado como pago`);
    } else if (status === "failed" || status === "cancelled") {
      // Cancelar pagamento
      await paymentService.cancelPixPayment(orderId, `PIX payment ${status}`);

      console.log(`❌ Pedido #${orderId} pagamento ${status}`);
    }

    res.json({
      success: true,
      message: "PIX webhook processed",
    });
  } catch (error: any) {
    console.error("PIX webhook error:", error);
    res.status(500).json({ error: "Webhook processing failed" });
  }
});

/**
 * POST /api/payment/manual-confirm
 * Endpoint para confirmar pagamento PIX manualmente (admin)
 */
router.post("/manual-confirm", async (req: Request, res: Response) => {
  try {
    const { orderId, userName } = req.body;

    if (!orderId || !userName) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Confirmar pagamento
    await paymentService.confirmPixPayment(orderId, userName);

    // Atualizar pedido no banco de dados
    // await orderService.updateOrderStatus(orderId, "paid");

    res.json({
      success: true,
      message: `Pedido #${orderId} confirmado manualmente`,
    });
  } catch (error: any) {
    console.error("Manual confirm error:", error);
    res.status(500).json({ error: "Failed to confirm payment" });
  }
});

/**
 * Handlers para eventos do Stripe
 */
async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  try {
    const orderId = paymentIntent.metadata?.orderId;

    if (!orderId) {
      console.warn("Payment intent succeeded but no orderId in metadata");
      return;
    }

    console.log(`✅ Pagamento Stripe confirmado - Pedido #${orderId}`);

    // Atualizar status do pedido para "paid"
    // await orderService.updateOrderStatus(parseInt(orderId), "paid");

    // Enviar notificação de sucesso
    // await notificationService.notifyPaymentSuccess(orderId);
  } catch (error) {
    console.error("Error handling payment intent succeeded:", error);
  }
}

async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  try {
    const orderId = paymentIntent.metadata?.orderId;

    if (!orderId) {
      console.warn("Payment intent failed but no orderId in metadata");
      return;
    }

    console.log(`❌ Pagamento Stripe falhou - Pedido #${orderId}`);

    // Atualizar status do pedido para "failed"
    // await orderService.updateOrderStatus(parseInt(orderId), "failed");

    // Enviar notificação de falha
    // await notificationService.notifyPaymentFailed(orderId);
  } catch (error) {
    console.error("Error handling payment intent failed:", error);
  }
}

async function handleChargeRefunded(charge: Stripe.Charge) {
  try {
    const orderId = charge.metadata?.orderId;

    if (!orderId) {
      console.warn("Charge refunded but no orderId in metadata");
      return;
    }

    console.log(`💰 Reembolso processado - Pedido #${orderId}`);

    // Atualizar status do pedido para "refunded"
    // await orderService.updateOrderStatus(parseInt(orderId), "refunded");

    // Enviar notificação de reembolso
    // await notificationService.notifyRefund(orderId);
  } catch (error) {
    console.error("Error handling charge refunded:", error);
  }
}

export default router;
