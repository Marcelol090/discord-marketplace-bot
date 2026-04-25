import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { DiscordWebhookService } from "../discord/DiscordWebhookService";
import { DiscordInteraction } from "@shared/discord-types";
import { container } from "../di/container";
import { ProductService } from "../../domain/services/ProductService";
import { CategoryService } from "../../domain/services/CategoryService";
import { OrderService } from "../../domain/services/OrderService";
import { CartService } from "../../domain/services/CartService";

export async function registerDiscordWebhookRoutes(app: FastifyInstance) {
  const discordPublicKey = process.env.DISCORD_PUBLIC_KEY;
  if (!discordPublicKey) {
    console.warn("DISCORD_PUBLIC_KEY not set, webhook verification disabled");
  }

  const webhookService = new DiscordWebhookService(discordPublicKey || "");

  // Get services from DI container
  const productService = container.resolve(ProductService);
  const categoryService = container.resolve(CategoryService);
  const orderService = container.resolve(OrderService);
  const cartService = container.resolve(CartService);

  app.post<{ Body: string }>(
    "/api/discord/webhook",
    async (request: FastifyRequest<{ Body: string }>, reply: FastifyReply) => {
      try {
        // Verify signature
        const signature = request.headers["x-signature-ed25519"] as string;
        const timestamp = request.headers["x-signature-timestamp"] as string;
        const rawBody = (request as any).rawBody || JSON.stringify(request.body);

        if (discordPublicKey && !webhookService.verifySignature(rawBody, signature, timestamp)) {
          return reply.status(401).send({ error: "Invalid signature" });
        }

        // Parse interaction
        const interaction: DiscordInteraction = webhookService.parseInteraction(rawBody);

        // Handle PING
        if (interaction.type === 1) {
          return reply.send(webhookService.handlePing());
        }

        // Handle slash commands
        if (webhookService.isSlashCommand(interaction)) {
          const commandName = webhookService.getCommandName(interaction);

          switch (commandName) {
            case "shop":
              return await handleShopCommand(
                interaction,
                reply,
                webhookService,
                productService,
                categoryService
              );

            case "cart":
              return await handleCartCommand(
                interaction,
                reply,
                webhookService,
                cartService
              );

            case "checkout":
              return await handleCheckoutCommand(
                interaction,
                reply,
                webhookService,
                cartService,
                orderService
              );

            case "orders":
              return await handleOrdersCommand(
                interaction,
                reply,
                webhookService,
                orderService
              );

            default:
              return reply.send(
                webhookService.createCommandResponse(
                  `Unknown command: ${commandName}`
                )
              );
          }
        }

        // Handle button clicks
        if (webhookService.isButtonClick(interaction)) {
          const customId = interaction.data?.custom_id;

          if (customId?.startsWith("add_to_cart_")) {
            return await handleAddToCartButton(
              interaction,
              reply,
              webhookService,
              customId,
              cartService
            );
          }

          if (customId?.startsWith("remove_from_cart_")) {
            return await handleRemoveFromCartButton(
              interaction,
              reply,
              webhookService,
              customId,
              cartService
            );
          }
        }

        // Handle select menus
        if (webhookService.isSelectMenu(interaction)) {
          const customId = interaction.data?.custom_id;

          if (customId === "category_select") {
            return await handleCategorySelect(
              interaction,
              reply,
              webhookService,
              productService
            );
          }
        }

        return reply.send(
          webhookService.createCommandResponse("Interaction not handled")
        );
      } catch (error) {
        console.error("Webhook error:", error);
        return reply.status(500).send({ error: "Internal server error" });
      }
    }
  );
}

async function handleShopCommand(
  interaction: DiscordInteraction,
  reply: FastifyReply,
  webhookService: DiscordWebhookService,
  productService: ProductService,
  categoryService: CategoryService
) {
  try {
    const categories = await categoryService.getAllCategories();
    const products = await productService.getActiveProducts();

    const categoryOptions = categories.map((cat) => ({
      label: `${cat.emoji || "📦"} ${cat.name}`,
      value: cat.id.toString(),
    }));

    const embed = {
      title: "🛍️ Marketplace",
      description: "Bem-vindo à nossa loja! Selecione uma categoria para ver os produtos.",
      color: 0x5865f2,
      fields: [
        {
          name: "Produtos Disponíveis",
          value: `Total: ${products.length} produtos`,
          inline: false,
        },
      ],
    };

    const components = [
      {
        type: 1, // ACTION_ROW
        components: [
          {
            type: 3, // SELECT_MENU
            custom_id: "category_select",
            placeholder: "Selecione uma categoria",
            options: categoryOptions,
          },
        ],
      },
    ];

    return reply.send({
      type: 4, // CHANNEL_MESSAGE_WITH_SOURCE
      data: {
        embeds: [embed],
        components,
      },
    });
  } catch (error) {
    console.error("Shop command error:", error);
    return reply.send(
      webhookService.createCommandResponse(
        "❌ Erro ao carregar a loja. Tente novamente mais tarde."
      )
    );
  }
}

async function handleCartCommand(
  interaction: DiscordInteraction,
  reply: FastifyReply,
  webhookService: DiscordWebhookService,
  cartService: CartService
) {
  try {
    const userId = parseInt(interaction.user?.id || "0");
    if (!userId) {
      return reply.send(
        webhookService.createCommandResponse("❌ Erro ao identificar o usuário")
      );
    }

    const cart = await cartService.getCart(userId);
    const items = cart.getItems();

    if (items.length === 0) {
      return reply.send(
        webhookService.createCommandResponse("🛒 Seu carrinho está vazio!")
      );
    }

    const embed = {
      title: "🛒 Seu Carrinho",
      description: `Total de itens: ${cart.getTotalItems()}`,
      color: 0x5865f2,
      fields: items.map((item) => ({
        name: `Produto ID: ${item.productId}`,
        value: `Quantidade: ${item.quantity}`,
        inline: true,
      })),
    };

    return reply.send({
      type: 4, // CHANNEL_MESSAGE_WITH_SOURCE
      data: {
        embeds: [embed],
      },
    });
  } catch (error) {
    console.error("Cart command error:", error);
    return reply.send(
      webhookService.createCommandResponse(
        "❌ Erro ao carregar o carrinho. Tente novamente mais tarde."
      )
    );
  }
}

async function handleCheckoutCommand(
  interaction: DiscordInteraction,
  reply: FastifyReply,
  webhookService: DiscordWebhookService,
  cartService: CartService,
  orderService: OrderService
) {
  try {
    const userId = parseInt(interaction.user?.id || "0");
    if (!userId) {
      return reply.send(
        webhookService.createCommandResponse("❌ Erro ao identificar o usuário")
      );
    }

    const cart = await cartService.getCart(userId);
    if (cart.isEmpty()) {
      return reply.send(
        webhookService.createCommandResponse("🛒 Seu carrinho está vazio!")
      );
    }

    const total = await cartService.getCartTotal(userId);

    const embed = {
      title: "💳 Checkout",
      description: `Total: R$ ${total}`,
      color: 0x5865f2,
      fields: [
        {
          name: "Itens",
          value: `${cart.getTotalItems()} produto(s)`,
          inline: true,
        },
      ],
    };

    return reply.send({
      type: 4, // CHANNEL_MESSAGE_WITH_SOURCE
      data: {
        embeds: [embed],
        content: "Selecione o método de pagamento:",
      },
    });
  } catch (error) {
    console.error("Checkout command error:", error);
    return reply.send(
      webhookService.createCommandResponse(
        "❌ Erro ao processar checkout. Tente novamente mais tarde."
      )
    );
  }
}

async function handleOrdersCommand(
  interaction: DiscordInteraction,
  reply: FastifyReply,
  webhookService: DiscordWebhookService,
  orderService: OrderService
) {
  try {
    const discordUserId = interaction.user?.id;
    if (!discordUserId) {
      return reply.send(
        webhookService.createCommandResponse("❌ Erro ao identificar o usuário")
      );
    }

    const orders = await orderService.getOrdersByDiscordUserId(discordUserId);

    if (orders.length === 0) {
      return reply.send(
        webhookService.createCommandResponse("📦 Você não tem pedidos ainda!")
      );
    }

    const embed = {
      title: "📦 Meus Pedidos",
      color: 0x5865f2,
      fields: orders.map((order) => ({
        name: `Pedido #${order.id}`,
        value: `Status: ${order.status}\nTotal: R$ ${order.totalAmount}`,
        inline: true,
      })),
    };

    return reply.send({
      type: 4, // CHANNEL_MESSAGE_WITH_SOURCE
      data: {
        embeds: [embed],
      },
    });
  } catch (error) {
    console.error("Orders command error:", error);
    return reply.send(
      webhookService.createCommandResponse(
        "❌ Erro ao carregar pedidos. Tente novamente mais tarde."
      )
    );
  }
}

async function handleAddToCartButton(
  interaction: DiscordInteraction,
  reply: FastifyReply,
  webhookService: DiscordWebhookService,
  customId: string,
  cartService: CartService
) {
  try {
    const productId = parseInt(customId.replace("add_to_cart_", ""));
    const userId = parseInt(interaction.user?.id || "0");

    if (!userId || !productId) {
      return reply.send(
        webhookService.createCommandResponse("❌ Erro ao adicionar ao carrinho")
      );
    }

    await cartService.addToCart(userId, productId, 1);

    return reply.send(
      webhookService.createCommandResponse(
        "✅ Produto adicionado ao carrinho!",
        true
      )
    );
  } catch (error) {
    console.error("Add to cart error:", error);
    return reply.send(
      webhookService.createCommandResponse(
        "❌ Erro ao adicionar ao carrinho. Tente novamente.",
        true
      )
    );
  }
}

async function handleRemoveFromCartButton(
  interaction: DiscordInteraction,
  reply: FastifyReply,
  webhookService: DiscordWebhookService,
  customId: string,
  cartService: CartService
) {
  try {
    const productId = parseInt(customId.replace("remove_from_cart_", ""));
    const userId = parseInt(interaction.user?.id || "0");

    if (!userId || !productId) {
      return reply.send(
        webhookService.createCommandResponse("❌ Erro ao remover do carrinho")
      );
    }

    await cartService.removeFromCart(userId, productId);

    return reply.send(
      webhookService.createCommandResponse(
        "✅ Produto removido do carrinho!",
        true
      )
    );
  } catch (error) {
    console.error("Remove from cart error:", error);
    return reply.send(
      webhookService.createCommandResponse(
        "❌ Erro ao remover do carrinho. Tente novamente.",
        true
      )
    );
  }
}

async function handleCategorySelect(
  interaction: DiscordInteraction,
  reply: FastifyReply,
  webhookService: DiscordWebhookService,
  productService: ProductService
) {
  try {
    const categoryId = parseInt(interaction.data?.values?.[0] || "0");

    if (!categoryId) {
      return reply.send(
        webhookService.createCommandResponse("❌ Categoria inválida")
      );
    }

    const products = await productService.getProductsByCategory(categoryId);

    if (products.length === 0) {
      return reply.send(
        webhookService.createCommandResponse(
          "📦 Nenhum produto disponível nesta categoria"
        )
      );
    }

    const embeds = products.map((product) => ({
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
          value: `${product.stock} unidades`,
          inline: true,
        },
      ],
      image: product.imageUrl ? { url: product.imageUrl } : undefined,
    }));

    const components = [
      {
        type: 1, // ACTION_ROW
        components: products.map((product) => ({
          type: 2, // BUTTON
          style: 1, // PRIMARY
          label: `Adicionar ao Carrinho`,
          custom_id: `add_to_cart_${product.id}`,
        })),
      },
    ];

    return reply.send({
      type: 4, // CHANNEL_MESSAGE_WITH_SOURCE
      data: {
        embeds: embeds.slice(0, 10), // Discord limit
        components,
      },
    });
  } catch (error) {
    console.error("Category select error:", error);
    return reply.send(
      webhookService.createCommandResponse(
        "❌ Erro ao carregar produtos. Tente novamente."
      )
    );
  }
}

export default registerDiscordWebhookRoutes;
