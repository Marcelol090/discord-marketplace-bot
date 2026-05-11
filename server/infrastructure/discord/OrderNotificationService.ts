import axios from "axios";
import { Order } from "../../domain/entities/Order";
import { buildEmbed } from "./discordMessageBuilders";

const DISCORD_API_BASE = "https://discord.com/api/v10";

interface StatusConfig {
  title: string;
  description: string;
  color: number;
  emoji: string;
}

const STATUS_MAP: Record<string, StatusConfig> = {
  paid: {
    title: "✅ Pagamento Confirmado!",
    description: "Seu pagamento foi recebido e confirmado com sucesso.",
    color: 0x10b981,
    emoji: "✅",
  },
  processing: {
    title: "⚙️ Pedido em Processamento",
    description: "Seu pedido está sendo preparado.",
    color: 0xf59e0b,
    emoji: "⚙️",
  },
  shipped: {
    title: "📦 Pedido Enviado!",
    description: "Seu pedido foi enviado.",
    color: 0x3b82f6,
    emoji: "📦",
  },
  delivered: {
    title: "🎉 Pedido Entregue!",
    description: "Seu pedido foi entregue com sucesso. Obrigado pela compra!",
    color: 0x8b5cf6,
    emoji: "🎉",
  },
  cancelled: {
    title: "❌ Pedido Cancelado",
    description: "Seu pedido foi cancelado.",
    color: 0xef4444,
    emoji: "❌",
  },
};

/**
 * Sends Discord DM notifications to users when order status changes.
 * Uses Discord REST API directly (no bot framework dependency).
 */
export class OrderNotificationService {
  private botToken: string;

  constructor(botToken: string) {
    this.botToken = botToken;
  }

  private get headers() {
    return {
      Authorization: `Bot ${this.botToken}`,
      "Content-Type": "application/json",
    };
  }

  /**
   * Send a DM to the user about an order status change.
   * Skips "pending" status (no notification needed).
   */
  async notifyStatusChange(order: Order): Promise<void> {
    const config = STATUS_MAP[order.status];
    if (!config) {
      // No notification for unknown/pending statuses
      return;
    }

    const fields: Array<{ name: string; value: string; inline: boolean }> = [
      { name: "📋 Pedido", value: `#${order.id}`, inline: true },
      { name: "💰 Valor", value: `R$ ${parseFloat(order.totalAmount).toFixed(2)}`, inline: true },
    ];

    if (order.status === "shipped" && order.trackingNumber) {
      fields.push({
        name: "📦 Código de Rastreio",
        value: `\`${order.trackingNumber}\``,
        inline: false,
      });
    }

    const embed = buildEmbed({
      title: config.title,
      description: config.description,
      color: config.color,
      fields,
      footer: `Marketplace Bot | Pedido #${order.id}`,
      timestamp: true,
    });

    try {
      await this.sendDM(order.discordUserId, { embeds: [embed.toJSON()] });
    } catch (error) {
      // Log but don't throw — notification failure shouldn't break order flow
      console.warn(
        `[OrderNotification] Failed to notify Discord user ${order.discordUserId} for order #${order.id}:`,
        error,
      );
    }
  }

  /**
   * Send a DM to a Discord user.
   * Creates a DM channel first, then sends the message.
   */
  private async sendDM(discordUserId: string, payload: any): Promise<void> {
    try {
      // Step 1: Open/get DM channel
      const channelResponse = await axios.post(
        `${DISCORD_API_BASE}/users/@me/channels`,
        { recipient_id: discordUserId },
        { headers: this.headers },
      );

      const channelId = channelResponse.data.id;

      // Step 2: Send message to DM channel
      await axios.post(
        `${DISCORD_API_BASE}/channels/${channelId}/messages`,
        payload,
        { headers: this.headers },
      );
    } catch (error: any) {
      const status = error?.response?.status;
      const code = error?.response?.data?.code;

      if (status === 403 && code === 50007) {
        // User has DMs disabled — silently skip
        console.info(
          `[OrderNotification] User ${discordUserId} has DMs disabled, skipping.`,
        );
        return;
      }

      // Re-throw other errors for logging
      throw error;
    }
  }
}