import { DiscordInteraction } from "@shared/discord-types";
import { ProductService } from "../../../domain/services/ProductService";
import { CategoryService } from "../../../domain/services/CategoryService";
import { container } from "../../di/container";

const productService = container.resolve(ProductService);
const categoryService = container.resolve(CategoryService);

export class ShopCommand {
  static async handle(interaction: DiscordInteraction): Promise<any> {
    try {
      // Get all categories
      const categories = await categoryService.getAllCategories();

      // Get featured products (first 5 active products)
      const products = await productService.getActiveProducts();
      const featured = products.slice(0, 5);

      // Build embeds for products
      const productEmbeds = featured.map((product: any) => ({
        title: product.name,
        description: product.description || "Sem descrição",
        color: 0x5865f2,
        fields: [
          {
            name: "Preço",
            value: `R$ ${product.price}`,
            inline: true,
          },
          {
            name: "Estoque",
            value: product.stock > 0 ? `${product.stock} disponível` : "Fora de estoque",
            inline: true,
          },
          {
            name: "Categoria",
            value: product.categoryId ? `ID: ${product.categoryId}` : "Sem categoria",
            inline: false,
          },
        ],
        image: product.imageUrl ? { url: product.imageUrl } : undefined,
        footer: {
          text: `ID do Produto: ${product.id}`,
        },
      }));

      // Main shop embed
      const shopEmbed = {
        title: "🛍️ Marketplace",
        description: "Bem-vindo à nossa loja! Confira os produtos disponíveis.",
        color: 0x5865f2,
        fields: [
          {
            name: "Categorias Disponíveis",
            value: categories.length > 0 
              ? categories.map((c: any) => `${c.emoji || "📦"} ${c.name}`).join("\n")
              : "Nenhuma categoria disponível",
            inline: false,
          },
          {
            name: "Produtos em Destaque",
            value: featured.length > 0 
              ? featured.map((p: any) => `• **${p.name}** - R$ ${p.price}`).join("\n")
              : "Nenhum produto disponível",
            inline: false,
          },
        ],
        footer: {
          text: "Use /shop browse para ver todos os produtos",
        },
      };

      return {
        type: 4, // CHANNEL_MESSAGE_WITH_SOURCE
        data: {
          embeds: [shopEmbed, ...productEmbeds],
          components: [
            {
              type: 1, // ACTION_ROW
              components: [
                {
                  type: 2, // BUTTON
                  style: 1, // PRIMARY
                  label: "Ver Todos os Produtos",
                  custom_id: "shop_browse",
                },
                {
                  type: 2, // BUTTON
                  style: 1, // PRIMARY
                  label: "Meu Carrinho",
                  custom_id: "cart_view",
                },
              ],
            },
            {
              type: 1, // ACTION_ROW
              components: [
                {
                  type: 3, // SELECT_MENU
                  custom_id: "category_select",
                  placeholder: "Selecione uma categoria",
                  options: categories.map((c: any) => ({
                    label: c.name,
                    value: c.id.toString(),
                    emoji: c.emoji ? { name: c.emoji } : undefined,
                  })),
                },
              ],
            },
          ],
        },
      };
    } catch (error) {
      console.error("Shop command error:", error);
      return {
        type: 4,
        data: {
          content: "❌ Erro ao carregar a loja. Tente novamente mais tarde.",
          flags: 64, // EPHEMERAL
        },
      };
    }
  }
}
