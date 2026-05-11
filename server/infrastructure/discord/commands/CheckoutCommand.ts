import { CartService } from "../../../domain/services/CartService";
import { OrderService } from "../../../domain/services/OrderService";
import { PaymentService } from "../../../domain/services/PaymentService";
import { ProductService } from "../../../domain/services/ProductService";
import { DiscordUserResolver } from "../DiscordUserResolver";
import { ButtonStyle } from "discord.js";
import { i18n, getLocale } from "../../i18n";
import { buildButtonRow, buildEmbed } from "../discordMessageBuilders";
import { createEmbedResponse, createEphemeralResponse } from "../discordInteractionResponses";

interface CartItemRef {
  productId: number;
  quantity: number;
}

/**
 * CheckoutCommand — Discord interaction handler for checkout flow.
 * Bridges Discord interactions to domain OrderService + PaymentService.
 */
export class CheckoutCommand {
  constructor(
    private cartService: CartService,
    private orderService: OrderService,
    private paymentService: PaymentService,
    private productService: ProductService,
    private resolver: DiscordUserResolver,
  ) {}

  /**
   * Initial checkout — show payment method selection
   */
  async handleCheckout(discordId: string, username: string, discordLocale?: string) {
    const locale = getLocale(discordLocale);
    const t = i18n.getFixedT(locale, "translation", "checkout");

    try {
      const userId = await this.resolver.resolve(discordId, username);
      const cart = await this.cartService.getCart(userId);
      const items = cart.getItems();

      if (items.length === 0) {
        return createEphemeralResponse({ content: t("empty") });
      }

      const total = await this.cartService.getCartTotal(userId);

      // Resolve product names for display
      const itemDetails = await Promise.all(
        items.map(async (item) => {
          const product = await this.productService.getProductById(item.productId);
          return {
            name: product?.name || `Produto #${item.productId}`,
            price: product ? parseFloat(product.price) : 0,
            quantity: item.quantity,
          };
        }),
      );

      const itemsList = itemDetails
        .map((item) => `• **${item.name}** x${item.quantity} — R$ ${(item.price * item.quantity).toFixed(2)}`)
        .join("\n");

      const embed = buildEmbed({
        title: t("title"),
        description: `${itemsList}\n\n${t("total", { total })}\n\n${t("selectMethod")}`,
        color: 0x8b5cf6,
        fields: [
          { name: "🔑 PIX", value: "Pagamento instantâneo via PIX (recomendado)", inline: false },
          { name: "💳 Cartão de Crédito", value: "Pagamento com Stripe (parcelado em até 12x)", inline: false },
        ],
        footer: "Clique no botão correspondente ao seu método de pagamento",
      });

      const row = buildButtonRow([
        { customId: "btn-pay-pix", label: "🔑 Pagar com PIX", style: ButtonStyle.Success },
        { customId: "btn-pay-stripe", label: "💳 Pagar com Cartão", style: ButtonStyle.Primary },
        { customId: "btn-cancel-checkout", label: "❌ Cancelar", style: ButtonStyle.Danger },
      ]);

      return createEmbedResponse({
        embeds: [embed.toJSON()],
        components: [row.toJSON()],
      });
    } catch (error) {
      console.error("CheckoutCommand.handleCheckout error:", error);
      return createEphemeralResponse({ content: t("error") });
    }
  }

  /**
   * PIX payment flow — create order + generate QR code
   */
  async handlePixPayment(
    discordId: string,
    username: string,
    totalAmount: string,
    cartItems: CartItemRef[],
    discordLocale?: string
  ) {
    const locale = getLocale(discordLocale);
    const t = i18n.getFixedT(locale, "translation", "checkout");

    try {
      const userId = await this.resolver.resolve(discordId, username);

      // Create order in the domain layer
      const order = await this.orderService.createOrder({
        userId,
        discordUserId: discordId,
        totalAmount,
        paymentMethod: "pix",
      });

      // Generate PIX QR Code
      const pixResult = await this.paymentService.generatePixQrCode({
        amount: totalAmount,
        description: `Pedido #${order.id}`,
        orderId: order.id,
      });

      if (!pixResult.success) {
        return createEphemeralResponse({ content: t("pixQrError") });
      }

      // Clear cart after order creation
      await this.cartService.clearCart(userId);

      const embed = buildEmbed({
        title: t("pixTitle"),
        description: t("pixDesc"),
        color: 0x10b981,
        fields: [
          { name: "💰 Valor", value: t("pixValue", { total: parseFloat(totalAmount).toFixed(2) }), inline: true },
          { name: "⏱️ Vencimento", value: t("pixExpiry"), inline: true },
          { name: "📋 Pedido", value: t("pixOrder", { id: order.id }), inline: false },
        ],
        footer: t("pixFooter"),
      });

      if (pixResult.qrCode) {
        embed.setImage(pixResult.qrCode);
      }

      if (pixResult.copyPaste) {
        embed.addFields({ name: "📋 Copia e Cola", value: t("pixCopyPaste", { key: pixResult.copyPaste }), inline: false });
      }

      const row = buildButtonRow([
        { customId: `btn-confirm-pix-${order.id}`, label: "✅ Já Paguei", style: ButtonStyle.Success },
        { customId: `btn-cancel-order-${order.id}`, label: "❌ Cancelar", style: ButtonStyle.Danger },
      ]);

      return createEmbedResponse({
        embeds: [embed.toJSON()],
        components: [row.toJSON()],
      });
    } catch (error) {
      console.error("CheckoutCommand.handlePixPayment error:", error);
      return createEphemeralResponse({ content: t("pixError") });
    }
  }

  /**
   * Card payment flow — create order + process via Stripe
   */
  async handleCardPayment(
    discordId: string,
    username: string,
    totalAmount: string,
    token: string,
    cartItems: CartItemRef[],
    discordLocale?: string
  ) {
    const locale = getLocale(discordLocale);
    const t = i18n.getFixedT(locale, "translation", "checkout");

    try {
      const userId = await this.resolver.resolve(discordId, username);

      const order = await this.orderService.createOrder({
        userId,
        discordUserId: discordId,
        totalAmount,
        paymentMethod: "credit_card",
      });

      const cardResult = await this.paymentService.processCardPayment({
        amount: totalAmount,
        description: `Pedido #${order.id}`,
        orderId: order.id,
        token,
      });

      if (!cardResult.success) {
        return createEphemeralResponse({
          content: t("cardFailed", { error: cardResult.error || "erro desconhecido" }),
        });
      }

      // Mark order as paid
      await this.orderService.markOrderAsPaid(order.id, cardResult.paymentId);

      // Clear cart
      await this.cartService.clearCart(userId);

      const embed = buildEmbed({
        title: t("cardSuccessTitle"),
        description: t("cardSuccessDesc", { id: order.id }),
        color: 0x10b981,
        fields: [
          { name: "💰 Total Pago", value: `R$ ${parseFloat(totalAmount).toFixed(2)}`, inline: true },
          { name: "💳 Método", value: t("cardMethod"), inline: true },
          { name: "📦 Entrega", value: t("cardDelivery"), inline: false },
        ],
        footer: `Pedido #${order.id} | ${cardResult.paymentId}`,
      });

      return createEmbedResponse({ embeds: [embed.toJSON()] });
    } catch (error) {
      console.error("CheckoutCommand.handleCardPayment error:", error);
      return createEphemeralResponse({ content: t("cardError") });
    }
  }
}