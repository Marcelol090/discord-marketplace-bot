import axios from "axios";
import { ENV } from "../../_core/env";
import pino from "pino";
import { buildEmbed } from "./discordMessageBuilders";

const logger = pino();

export interface ChannelPostOptions {
  guildId: string;
  channelId: string;
  embeds: any[];
  components?: any[];
  content?: string;
}

export interface ProductShowcaseOptions {
  guildId: string;
  showcaseChannelId: string;
  products: Array<{
    id: number;
    name: string;
    description?: string;
    price: number;
    imageUrl?: string;
    stock: number;
    categoryId: number;
  }>;
}

export interface AnnouncementOptions {
  guildId: string;
  announcementChannelId: string;
  title: string;
  description: string;
  imageUrl?: string;
  color?: number;
}

export interface PromotionOptions {
  guildId: string;
  promotionChannelId: string;
  title: string;
  discount: number;
  products: Array<{
    id: number;
    name: string;
    originalPrice: number;
    discountedPrice: number;
  }>;
  endDate: string;
}

export class ChannelPostingService {
  private botToken: string;
  private discordApiUrl = "https://discord.com/api/v10";

  constructor() {
    this.botToken = ENV.discordBotToken;
  }

  async postToChannel(options: ChannelPostOptions): Promise<void> {
    try {
      const payload = {
        content: options.content || undefined,
        embeds: options.embeds,
        components: options.components || undefined,
      };

      await axios.post(
        `${this.discordApiUrl}/channels/${options.channelId}/messages`,
        payload,
        {
          headers: {
            Authorization: `Bot ${this.botToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      logger.info(
        `[ChannelPosting] Message posted to channel ${options.channelId}`
      );
    } catch (error) {
      logger.error(
        { error },
        `[ChannelPosting] Failed to post to channel ${options.channelId}`
      );
      throw error;
    }
  }

  async postProductShowcase(options: ProductShowcaseOptions): Promise<void> {
    try {
      if (!options.showcaseChannelId) {
        logger.warn("[ChannelPosting] Showcase channel not configured");
        return;
      }

      const embeds = options.products.map((product) => {
        return buildEmbed({
          title: `📦 ${product.name}`,
          description: product.description || "Produto sem descrição",
          color: 0x10b981,
          fields: [
            { name: "💵 Preço", value: `**R$ ${product.price.toFixed(2)}**`, inline: true },
            { name: "📋 Estoque", value: `${product.stock > 0 ? "✅" : "❌"} ${product.stock} unidades`, inline: true },
            { name: "🏷️ Categoria", value: `ID: ${product.categoryId}`, inline: true },
          ],
          footer: `ID: ${product.id} | Clique em /shop para comprar`,
          thumbnailUrl: product.imageUrl || undefined,
        }).toJSON();
      });

      await this.postToChannel({
        guildId: options.guildId,
        channelId: options.showcaseChannelId,
        embeds,
        content: "🛍️ **Novos Produtos Disponíveis!**",
      });

      logger.info("[ChannelPosting] Product showcase posted successfully");
    } catch (error) {
      logger.error(
        { error },
        "[ChannelPosting] Failed to post product showcase"
      );
      throw error;
    }
  }

  async postAnnouncement(options: AnnouncementOptions): Promise<void> {
    try {
      if (!options.announcementChannelId) {
        logger.warn("[ChannelPosting] Announcement channel not configured");
        return;
      }

      const embed = buildEmbed({
        title: options.title,
        description: options.description,
        color: options.color || 0x3b82f6,
        footer: "Clique em /shop para explorar nossos produtos",
        imageUrl: options.imageUrl || undefined,
      });

      await this.postToChannel({
        guildId: options.guildId,
        channelId: options.announcementChannelId,
        embeds: [embed.toJSON()],
        content: "📢 **Novo Anúncio!**",
      });

      logger.info("[ChannelPosting] Announcement posted successfully");
    } catch (error) {
      logger.error(
        { error },
        "[ChannelPosting] Failed to post announcement"
      );
      throw error;
    }
  }

  async postPromotion(options: PromotionOptions): Promise<void> {
    try {
      if (!options.promotionChannelId) {
        logger.warn("[ChannelPosting] Promotion channel not configured");
        return;
      }

      const productsList = options.products
        .map(
          (p) =>
            `• **${p.name}**: ~~R$ ${p.originalPrice.toFixed(2)}~~ → **R$ ${p.discountedPrice.toFixed(2)}** (-${options.discount}%)`
        )
        .join("\n");

      const embed = buildEmbed({
        title: `🎉 ${options.title}`,
        description: `**Desconto de ${options.discount}%!**\n\n${productsList}`,
        color: 0xf59e0b,
        fields: [
          { name: "⏰ Válido até", value: new Date(options.endDate).toLocaleDateString("pt-BR"), inline: true },
          { name: "🛒 Comprar", value: "Use `/shop` para ver todos os produtos", inline: true },
        ],
        footer: "Aproveite essa promoção especial!",
      });

      await this.postToChannel({
        guildId: options.guildId,
        channelId: options.promotionChannelId,
        embeds: [embed.toJSON()],
        content: "🎊 **PROMOÇÃO ESPECIAL!**",
      });

      logger.info("[ChannelPosting] Promotion posted successfully");
    } catch (error) {
      logger.error(
        { error },
        "[ChannelPosting] Failed to post promotion"
      );
      throw error;
    }
  }

  async postNewProduct(options: {
    guildId: string;
    announcementChannelId: string;
    product: {
      id: number;
      name: string;
      description?: string;
      price: number;
      imageUrl?: string;
    };
  }): Promise<void> {
    try {
      if (!options.announcementChannelId) {
        logger.warn("[ChannelPosting] Announcement channel not configured");
        return;
      }

      const embed = buildEmbed({
        title: `✨ Novo Produto: ${options.product.name}`,
        description: options.product.description || "Produto novo no catálogo!",
        color: 0x8b5cf6,
        fields: [
          { name: "💵 Preço", value: `**R$ ${options.product.price.toFixed(2)}**`, inline: true },
          { name: "🆔 ID", value: `${options.product.id}`, inline: true },
        ],
        footer: "Use /shop para comprar este produto",
        thumbnailUrl: options.product.imageUrl || undefined,
      });

      await this.postToChannel({
        guildId: options.guildId,
        channelId: options.announcementChannelId,
        embeds: [embed.toJSON()],
        content: "🎁 **Novo Produto Adicionado!**",
      });

      logger.info("[ChannelPosting] New product announcement posted");
    } catch (error) {
      logger.error(
        { error },
        "[ChannelPosting] Failed to post new product announcement"
      );
      throw error;
    }
  }
}