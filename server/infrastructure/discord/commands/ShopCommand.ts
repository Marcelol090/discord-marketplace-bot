import { ProductService } from "../../../domain/services/ProductService";
import { CategoryService } from "../../../domain/services/CategoryService";
import { ButtonStyle } from "discord.js";
import { i18n, getLocale } from "../../i18n";
import { buildButtonRow, buildEmbed, buildSelectMenuRow } from "../discordMessageBuilders";
import { createEmbedResponse, createEphemeralResponse } from "../discordInteractionResponses";

const ITEMS_PER_PAGE = 5;

/**
 * ShopCommand — Discord interaction handler for browsing products.
 * Supports offset-based pagination and category filtering.
 */
export class ShopCommand {
  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
  ) {}

  /**
   * Handle /shop command with pagination.
   * @param page - 1-indexed page number
   */
  async handle(page: number = 1, discordLocale?: string): Promise<any> {
    const locale = getLocale(discordLocale);
    const t = i18n.getFixedT(locale, "translation", "shop");

    try {
      const categories = await this.categoryService.getAllCategories();
      const allProducts = await this.productService.getActiveProducts();

      return this.buildResponse(allProducts, categories, page, undefined, locale, t);
    } catch (error) {
      console.error("ShopCommand.handle error:", error);
      return createEphemeralResponse({ content: t("error") });
    }
  }

  /**
   * Handle category-filtered browsing.
   */
  async handleByCategory(categoryId: number, page: number = 1, discordLocale?: string): Promise<any> {
    const locale = getLocale(discordLocale);
    const t = i18n.getFixedT(locale, "translation", "shop");

    try {
      const categories = await this.categoryService.getAllCategories();
      const products = await this.productService.getProductsByCategory(categoryId);

      return this.buildResponse(products, categories, page, categoryId, locale, t);
    } catch (error) {
      console.error("ShopCommand.handleByCategory error:", error);
      return createEphemeralResponse({ content: t("errorProducts") });
    }
  }

  private buildResponse(
    allProducts: any[],
    categories: any[],
    page: number,
    categoryId: number | undefined,
    locale: string,
    t: any
  ): any {
    const totalPages = Math.max(1, Math.ceil(allProducts.length / ITEMS_PER_PAGE));
    const safePage = Math.max(1, Math.min(page, totalPages));
    const offset = (safePage - 1) * ITEMS_PER_PAGE;
    const pageProducts = allProducts.slice(offset, offset + ITEMS_PER_PAGE);

    // Build product embeds
    const productEmbeds = pageProducts.map((product: any) => {
      return buildEmbed({
        title: `📦 ${product.name}`,
        description: product.description || "Sem descrição",
        color: 0x5865f2,
        fields: [
          { name: t("price"), value: `R$ ${product.price}`, inline: true },
          {
            name: t("stock"),
            value: product.stock > 0 ? t("stockAvailable", { count: product.stock }) : t("stockUnavailable"),
            inline: true,
          },
        ],
        footer: t("productFooter", { id: product.id }),
        thumbnailUrl: product.imageUrl || undefined,
      });
    });

    // Main shop embed
    const shopEmbed = buildEmbed({
      title: t("title"),
      description: t("description"),
      color: 0x5865f2,
      fields: [
        {
          name: t("categories"),
          value:
            categories.length > 0
              ? categories.map((c: any) => `${c.emoji || "📦"} ${c.name}`).join("\n")
              : t("empty"),
          inline: false,
        },
        {
          name: t("products"),
          value:
            pageProducts.length > 0
              ? pageProducts.map((p: any) => `• **${p.name}** - R$ ${p.price}`).join("\n")
              : t("empty"),
          inline: false,
        },
      ],
      footer: `Página ${safePage} de ${totalPages} | ${allProducts.length} produto(s)`,
    });

    const components: any[] = [];
    const navButtons: Array<{ customId: string; label: string; style: ButtonStyle }> = [];

    if (safePage > 1) {
      navButtons.push({
        customId: `shop_page_${safePage - 1}`,
        label: "⬅️ Anterior",
        style: ButtonStyle.Secondary,
      });
    }

    navButtons.push({
      customId: "cart_view",
      label: t("addToCart").includes("Carrinho") ? "🛒 Meu Carrinho" : "🛒 My Cart",
      style: ButtonStyle.Primary,
    });

    if (safePage < totalPages) {
      navButtons.push({
        customId: `shop_page_${safePage + 1}`,
        label: "Próximo ➡️",
        style: ButtonStyle.Secondary,
      });
    }
    
    components.push(buildButtonRow(navButtons).toJSON());

    // Category select menu (only if categories exist)
    if (categories.length > 0) {
      components.push(
        buildSelectMenuRow({
          customId: "category_select",
          placeholder: t("placeholder"),
          options: categories.map((c: any) => ({
            label: c.name,
            value: c.id.toString(),
            emoji: c.emoji ? { name: c.emoji } : undefined,
          })),
        }).toJSON(),
      );
    }

    return createEmbedResponse({
      embeds: [shopEmbed.toJSON(), ...productEmbeds.map((e) => e.toJSON())],
      components,
    });
  }
}