import axios from "axios";
import { ButtonStyle } from "discord.js";
import { ENV } from "../../_core/env";
import { storagePut, storageGet } from "../../storage";
import { buildButtonRow, buildEmbed } from "./discordMessageBuilders";

/**
 * Serviço de entrega automática de arquivos digitais via Discord DM
 * Responsável por enviar arquivos .otbm após confirmação de pagamento
 */
export class DigitalDeliveryService {
  private botToken = ENV.discordBotToken;
  private discordApiUrl = "https://discord.com/api/v10";

  /**
   * Envia arquivo digital para o usuário via DM
   * @param discordUserId ID do usuário no Discord
   * @param productName Nome do produto
   * @param assetKey Chave do arquivo armazenado no S3
   * @param orderId ID do pedido
   */
  async deliverDigitalAsset(
    discordUserId: string,
    productName: string,
    assetKey: string,
    orderId: number
  ): Promise<boolean> {
    try {
      if (!this.botToken) {
        console.error("Discord bot token not configured");
        return false;
      }

      // Obter URL assinada do arquivo
      const { url: assetUrl } = await storageGet(assetKey);

      // Criar DM channel com o usuário
      const dmChannelId = await this.createDMChannel(discordUserId);
      if (!dmChannelId) {
        console.error(`Failed to create DM channel with user ${discordUserId}`);
        return false;
      }

      // Enviar mensagem com link de download
      const embed = buildEmbed({
        title: "🎉 Seu Produto Está Pronto!",
        description: `Obrigado pela compra! Seu arquivo foi processado com sucesso.`,
        color: 0x10b981,
        fields: [
          { name: "📦 Produto", value: productName, inline: false },
          { name: "📋 Pedido ID", value: `\`${orderId}\``, inline: true },
          { name: "⏱️ Data", value: new Date().toLocaleString("pt-BR"), inline: true },
          { name: "📥 Download", value: `[Clique aqui para baixar](${assetUrl})`, inline: false },
        ],
        footer: "Arquivo disponível por 7 dias",
      });

      const row = buildButtonRow([
        { style: ButtonStyle.Link, label: "📥 Baixar Arquivo", url: assetUrl },
      ]);

      // Enviar embed com botão de download
      await axios.post(
        `${this.discordApiUrl}/channels/${dmChannelId}/messages`,
        {
          embeds: [embed.toJSON()],
          components: [row.toJSON()],
        },
        {
          headers: {
            Authorization: `Bot ${this.botToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log(`✅ Arquivo entregue para usuário ${discordUserId}`);
      return true;
    } catch (error) {
      console.error("Error delivering digital asset:", error);
      return false;
    }
  }

  /**
   * Envia múltiplos arquivos para o usuário
   * @param discordUserId ID do usuário no Discord
   * @param items Lista de itens com nome e chave do arquivo
   * @param orderId ID do pedido
   */
  async deliverMultipleAssets(
    discordUserId: string,
    items: Array<{ name: string; assetKey: string }>,
    orderId: number
  ): Promise<boolean> {
    try {
      if (!this.botToken) {
        console.error("Discord bot token not configured");
        return false;
      }

      // Criar DM channel com o usuário
      const dmChannelId = await this.createDMChannel(discordUserId);
      if (!dmChannelId) {
        console.error(`Failed to create DM channel with user ${discordUserId}`);
        return false;
      }

      // Preparar lista de downloads
      const downloadLinks = await Promise.all(
        items.map(async (item) => {
          try {
            const { url } = await storageGet(item.assetKey);
            return { name: item.name, url };
          } catch (error) {
            console.error(`Failed to get URL for ${item.name}:`, error);
            return null;
          }
        })
      );

      const validLinks = downloadLinks.filter((link) => link !== null);

      if (validLinks.length === 0) {
        console.error("No valid download links generated");
        return false;
      }

      // Criar embed com todos os downloads
      const embed = buildEmbed({
        title: "🎉 Seus Produtos Estão Prontos!",
        description: `Obrigado pela compra! Seus arquivos foram processados com sucesso.`,
        color: 0x10b981,
        fields: [
          { name: "📦 Itens", value: validLinks.map((link) => `• ${link.name}`).join("\n"), inline: false },
          { name: "📋 Pedido ID", value: `\`${orderId}\``, inline: true },
          { name: "⏱️ Data", value: new Date().toLocaleString("pt-BR"), inline: true },
        ],
        footer: "Arquivos disponíveis por 7 dias",
      });

      // Criar componentes com botões de download
      const components = validLinks.map((link) => {
        return buildButtonRow([
          { style: ButtonStyle.Link, label: `📥 ${link.name}`, url: link.url },
        ]).toJSON();
      });

      // Enviar mensagem
      await axios.post(
        `${this.discordApiUrl}/channels/${dmChannelId}/messages`,
        {
          embeds: [embed.toJSON()],
          components: components.slice(0, 5), // Discord limit
        },
        {
          headers: {
            Authorization: `Bot ${this.botToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Se houver mais de 5 arquivos, enviar mensagem adicional
      if (components.length > 5) {
        await axios.post(
          `${this.discordApiUrl}/channels/${dmChannelId}/messages`,
          {
            content: "📥 **Mais Downloads:**",
            components: components.slice(5),
          },
          {
            headers: {
              Authorization: `Bot ${this.botToken}`,
              "Content-Type": "application/json",
            },
          }
        );
      }

      console.log(`✅ ${validLinks.length} arquivo(s) entregue(s) para usuário ${discordUserId}`);
      return true;
    } catch (error) {
      console.error("Error delivering multiple assets:", error);
      return false;
    }
  }

  /**
   * Notifica o usuário que o pedido foi confirmado
   * @param discordUserId ID do usuário no Discord
   * @param orderId ID do pedido
   * @param totalAmount Valor total do pedido
   * @param paymentMethod Método de pagamento
   */
  async notifyOrderConfirmed(
    discordUserId: string,
    orderId: number,
    totalAmount: number,
    paymentMethod: "pix" | "credit_card"
  ): Promise<boolean> {
    try {
      if (!this.botToken) {
        console.error("Discord bot token not configured");
        return false;
      }

      // Criar DM channel com o usuário
      const dmChannelId = await this.createDMChannel(discordUserId);
      if (!dmChannelId) {
        console.error(`Failed to create DM channel with user ${discordUserId}`);
        return false;
      }

      const paymentMethodLabel = paymentMethod === "pix" ? "🔑 PIX" : "💳 Cartão de Crédito";

      const embed = buildEmbed({
        title: "✅ Pedido Confirmado!",
        description: "Seu pagamento foi recebido com sucesso. Seus arquivos serão entregues em breve.",
        color: 0x10b981,
        fields: [
          { name: "📋 Pedido ID", value: `\`${orderId}\``, inline: true },
          { name: "💰 Valor", value: `R$ ${totalAmount.toFixed(2)}`, inline: true },
          { name: "💳 Método de Pagamento", value: paymentMethodLabel, inline: true },
          { name: "📥 Próximos Passos", value: "Você receberá seus arquivos em uma mensagem separada. Verifique suas DMs!", inline: false },
        ],
        footer: "Obrigado por sua compra!",
      });

      await axios.post(
        `${this.discordApiUrl}/channels/${dmChannelId}/messages`,
        {
          embeds: [embed.toJSON()],
        },
        {
          headers: {
            Authorization: `Bot ${this.botToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log(`✅ Notificação de confirmação enviada para ${discordUserId}`);
      return true;
    } catch (error) {
      console.error("Error notifying order confirmed:", error);
      return false;
    }
  }

  /**
   * Cria um canal de DM com o usuário
   * @param discordUserId ID do usuário no Discord
   * @returns ID do canal de DM ou null se falhar
   */
  private async createDMChannel(discordUserId: string): Promise<string | null> {
    try {
      const response = await axios.post(
        `${this.discordApiUrl}/users/@me/channels`,
        {
          recipient_id: discordUserId,
        },
        {
          headers: {
            Authorization: `Bot ${this.botToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      return response.data.id;
    } catch (error) {
      console.error(`Error creating DM channel with user ${discordUserId}:`, error);
      return null;
    }
  }
}