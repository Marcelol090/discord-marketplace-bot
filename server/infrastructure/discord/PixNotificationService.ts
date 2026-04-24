import { ENV } from "../../_core/env";
import axios from "axios";

export interface PixNotificationPayload {
  orderId: number;
  userId: number;
  userName: string;
  userDiscordId: string;
  products: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  pixKey: string;
}

export class PixNotificationService {
  private discordBotToken = ENV.discordBotToken;
  private discordServerId = ENV.discordServerId;
  private discordCategoryId = ENV.discordCategoryId;
  private pixKey = ENV.pixKey;

  /**
   * Envia notificação de PIX para o servidor Discord
   * Cria uma thread com os detalhes do pedido e instruções de pagamento
   */
  async notifyPixPayment(payload: PixNotificationPayload): Promise<void> {
    try {
      if (!this.discordBotToken || !this.discordServerId || !this.discordCategoryId) {
        console.warn("Discord credentials not configured for PIX notifications");
        return;
      }

      // Formata os produtos
      const productsList = payload.products
        .map((p) => `• **${p.name}** x${p.quantity} - R$ ${p.price.toFixed(2)}`)
        .join("\n");

      // Cria a mensagem de notificação
      const message = {
        content: `🛍️ **Novo Pedido - Pagamento PIX**\n\n**Cliente:** ${payload.userName} (${payload.userDiscordId})\n**ID do Pedido:** #${payload.orderId}\n\n**Produtos:**\n${productsList}\n\n**Valor Total:** R$ ${payload.totalAmount.toFixed(2)}\n\n💳 **Instruções de Pagamento:**\nChave PIX: \`${this.pixKey}\`\n\nAguardando confirmação do pagamento...`,
        embeds: [
          {
            color: 0x5865f2,
            title: "Detalhes do Pedido",
            fields: [
              {
                name: "ID do Pedido",
                value: `#${payload.orderId}`,
                inline: true,
              },
              {
                name: "Cliente",
                value: payload.userName,
                inline: true,
              },
              {
                name: "Valor Total",
                value: `R$ ${payload.totalAmount.toFixed(2)}`,
                inline: true,
              },
              {
                name: "Chave PIX",
                value: `\`${this.pixKey}\``,
                inline: false,
              },
              {
                name: "Produtos",
                value: productsList,
                inline: false,
              },
            ],
            footer: {
              text: "Marketplace Bot - PIX Payment",
            },
            timestamp: new Date().toISOString(),
          },
        ],
        components: [
          {
            type: 1, // ACTION_ROW
            components: [
              {
                type: 2, // BUTTON
                style: 3, // SUCCESS
                label: "✅ Pagamento Confirmado",
                custom_id: `pix_confirm_${payload.orderId}`,
              },
              {
                type: 2, // BUTTON
                style: 4, // DANGER
                label: "❌ Cancelar Pedido",
                custom_id: `pix_cancel_${payload.orderId}`,
              },
            ],
          },
        ],
      };

      // Envia a mensagem para o canal
      const channelId = this.discordCategoryId;
      const url = `https://discord.com/api/v10/channels/${channelId}/messages`;

      const response = await axios.post(url, message, {
        headers: {
          Authorization: `Bot ${this.discordBotToken}`,
          "Content-Type": "application/json",
        },
      });

      console.log(`PIX notification sent for order #${payload.orderId}:`, response.data.id);
    } catch (error) {
      console.error("Failed to send PIX notification:", error);
      throw error;
    }
  }

  /**
   * Envia notificação de pagamento confirmado
   */
  async notifyPaymentConfirmed(orderId: number, userName: string): Promise<void> {
    try {
      if (!this.discordBotToken || !this.discordCategoryId) {
        console.warn("Discord credentials not configured");
        return;
      }

      const message = {
        content: `✅ **Pagamento Confirmado!**\n\n**Pedido:** #${orderId}\n**Cliente:** ${userName}\n\nO pagamento foi recebido com sucesso. O pedido será processado em breve.`,
        embeds: [
          {
            color: 0x57f287, // Green
            title: "Pagamento Confirmado",
            description: `Pedido #${orderId} foi pago com sucesso!`,
            footer: {
              text: "Marketplace Bot",
            },
            timestamp: new Date().toISOString(),
          },
        ],
      };

      const channelId = this.discordCategoryId;
      const url = `https://discord.com/api/v10/channels/${channelId}/messages`;

      await axios.post(url, message, {
        headers: {
          Authorization: `Bot ${this.discordBotToken}`,
          "Content-Type": "application/json",
        },
      });

      console.log(`Payment confirmation sent for order #${orderId}`);
    } catch (error) {
      console.error("Failed to send payment confirmation:", error);
      throw error;
    }
  }

  /**
   * Envia notificação de pedido cancelado
   */
  async notifyPaymentCancelled(orderId: number, reason: string): Promise<void> {
    try {
      if (!this.discordBotToken || !this.discordCategoryId) {
        console.warn("Discord credentials not configured");
        return;
      }

      const message = {
        content: `❌ **Pedido Cancelado**\n\n**Pedido:** #${orderId}\n**Motivo:** ${reason}`,
        embeds: [
          {
            color: 0xed4245, // Red
            title: "Pedido Cancelado",
            description: `Pedido #${orderId} foi cancelado.`,
            fields: [
              {
                name: "Motivo",
                value: reason,
                inline: false,
              },
            ],
            footer: {
              text: "Marketplace Bot",
            },
            timestamp: new Date().toISOString(),
          },
        ],
      };

      const channelId = this.discordCategoryId;
      const url = `https://discord.com/api/v10/channels/${channelId}/messages`;

      await axios.post(url, message, {
        headers: {
          Authorization: `Bot ${this.discordBotToken}`,
          "Content-Type": "application/json",
        },
      });

      console.log(`Payment cancellation sent for order #${orderId}`);
    } catch (error) {
      console.error("Failed to send payment cancellation:", error);
      throw error;
    }
  }
}
