import { CartService } from "../../../domain/services/CartService";
import { ProductService } from "../../../domain/services/ProductService";
import { DiscordUserResolver } from "../DiscordUserResolver";
import { ButtonStyle } from "discord.js";
import { i18n, getLocale } from "../../i18n";
import { buildButtonRow, buildEmbed } from "../discordMessageBuilders";
import { createEmbedResponse, createEphemeralResponse } from "../discordInteractionResponses";

/**
 * CartCommand — Discord interaction handler for cart operations.
 * Delegates all business logic to domain CartService via DiscordUserResolver bridge.
 */
export class CartCommand {
  constructor(
    private cartService: CartService,
    private productService: ProductService,
    private resolver: DiscordUserResolver,
  ) {}

  async handleViewCart(discordId: string, username: string, discordLocale?: string) {
    const locale = getLocale(discordLocale);
    const t = i18n.getFixedT(locale, "translation", "cart");
    
    try {
      const userId = await this.resolver.resolve(discordId, username);
      const cart = await this.cartService.getCart(userId);
      const items = cart.getItems();

      if (items.length === 0) {
        return createEphemeralResponse({
          content: t("empty") + "\n\nUse `/shop` para adicionar produtos.",
        });
      }

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

      const total = await this.cartService.getCartTotal(userId);

      const itemsList = itemDetails
        .map(
          (item) =>
            `• **${item.name}** - R$ ${item.price.toFixed(2)} x${item.quantity} = R$ ${(item.price * item.quantity).toFixed(2)}`,
        )
        .join("\n");

      const embed = buildEmbed({
        title: t("title"),
        description: itemsList,
        color: 0x3b82f6,
        fields: [
          {
            name: "📊 Resumo",
            value: `${t("totalItems", { count: items.length })}\nValor total: **R$ ${total}**`,
            inline: false,
          },
        ],
        footer: "Use os botões abaixo para gerenciar seu carrinho",
      });

      const row = buildButtonRow([
        { customId: "btn-checkout", label: "💳 Checkout", style: ButtonStyle.Primary },
        { customId: "btn-clear-cart", label: "🗑️ Limpar Carrinho", style: ButtonStyle.Danger },
        {
          customId: "btn-continue-shopping",
          label: "🛍️ Continuar Comprando",
          style: ButtonStyle.Secondary,
        },
      ]);

      return createEmbedResponse({
        embeds: [embed.toJSON()],
        components: [row.toJSON()],
      });
    } catch (error) {
      console.error("CartCommand.handleViewCart error:", error);
      return {
        type: 4,
        data: {
          content: t("error"),
          flags: 64,
        },
      };
    }
  }

  async addToCart(discordId: string, username: string, productId: number, quantity: number = 1, discordLocale?: string) {
    const locale = getLocale(discordLocale);
    const t = i18n.getFixedT(locale, "translation", "cart");

    try {
      const userId = await this.resolver.resolve(discordId, username);
      await this.cartService.addToCart(userId, productId, quantity);

      const product = await this.productService.getProductById(productId);
      const name = product?.name || `Produto #${productId}`;
      const price = product ? parseFloat(product.price) : 0;

      return createEphemeralResponse({
        content: `${t("addSuccess")}\n\n**${name}**\n💰 Valor: R$ ${price.toFixed(2)}\n📦 Quantidade: ${quantity}`,
      });
    } catch (error: any) {
      const message = error.message === "Insufficient stock"
        ? "❌ Estoque insuficiente para este produto."
        : error.message === "Product not found"
          ? "❌ Produto não encontrado."
          : t("addError");

      return createEphemeralResponse({ content: message });
    }
  }

  async removeFromCart(discordId: string, username: string, productId: number, discordLocale?: string) {
    const locale = getLocale(discordLocale);
    const t = i18n.getFixedT(locale, "translation", "cart");

    try {
      const userId = await this.resolver.resolve(discordId, username);
      await this.cartService.removeFromCart(userId, productId);

      return createEphemeralResponse({ content: t("removeSuccess") });
    } catch (error) {
      return createEphemeralResponse({ content: t("removeError") });
    }
  }

  async updateQuantity(discordId: string, username: string, productId: number, quantity: number, discordLocale?: string) {
    const locale = getLocale(discordLocale);
    
    try {
      const userId = await this.resolver.resolve(discordId, username);
      await this.cartService.updateCartItemQuantity(userId, productId, quantity);

      return createEphemeralResponse({ content: `✅ Quantidade atualizada para ${quantity}!` });
    } catch (error: any) {
      return createEphemeralResponse({
        content: error.message === "Item not found in cart"
          ? "❌ Item não encontrado no carrinho."
          : "❌ Erro ao atualizar quantidade.",
      });
    }
  }

  async clearCart(discordId: string, username: string, discordLocale?: string) {
    try {
      const userId = await this.resolver.resolve(discordId, username);
      await this.cartService.clearCart(userId);

      return createEphemeralResponse({ content: "✅ Carrinho limpo com sucesso!" });
    } catch (error) {
      return createEphemeralResponse({ content: "❌ Erro ao limpar o carrinho." });
    }
  }
}