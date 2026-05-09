import { injectable } from "tsyringe";

interface CartItem {
  mapId: number;
  name: string;
  price: number;
  quantity: number;
}

interface UserCart {
  userId: string;
  items: CartItem[];
  total: number;
}

@injectable()
export class CartCommand {
  private userCarts: Map<string, UserCart> = new Map();

  handleViewCart(userId: string) {
    const cart = this.userCarts.get(userId);

    if (!cart || cart.items.length === 0) {
      return {
        type: 4,
        data: {
          content: "🛒 Seu carrinho está vazio!\n\nUse `/comprar` para adicionar mapas.",
          flags: 64,
        },
      };
    }

    const itemsList = cart.items
      .map(
        (item) =>
          `• **${item.name}** - R$ ${item.price.toFixed(2)} x${item.quantity} = R$ ${(item.price * item.quantity).toFixed(2)}`
      )
      .join("\n");

    return {
      type: 4,
      data: {
        embeds: [
          {
            title: "🛒 Seu Carrinho",
            description: itemsList,
            color: 0x3b82f6,
            fields: [
              {
                name: "📊 Resumo",
                value: `Total de itens: ${cart.items.length}\nValor total: **R$ ${cart.total.toFixed(2)}**`,
                inline: false,
              },
            ],
            footer: {
              text: "Use os botões abaixo para gerenciar seu carrinho",
            },
          },
        ],
        components: [
          {
            type: 1,
            components: [
              {
                type: 2,
                label: "💳 Ir para Checkout",
                custom_id: "btn-checkout",
                style: 1, // Primary
              },
              {
                type: 2,
                label: "🗑️ Limpar Carrinho",
                custom_id: "btn-clear-cart",
                style: 4, // Danger
              },
              {
                type: 2,
                label: "🛍️ Continuar Comprando",
                custom_id: "btn-continue-shopping",
                style: 2, // Secondary
              },
            ],
          },
        ],
      },
    };
  }

  addToCart(userId: string, mapId: number, name: string, price: number) {
    if (!this.userCarts.has(userId)) {
      this.userCarts.set(userId, { userId, items: [], total: 0 });
    }

    const cart = this.userCarts.get(userId)!;
    const existingItem = cart.items.find((item) => item.mapId === mapId);

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.items.push({ mapId, name, price, quantity: 1 });
    }

    this.updateCartTotal(cart);

    return {
      type: 4,
      data: {
        content: `✅ **${name}** adicionado ao carrinho!\n\n💰 Valor: R$ ${price.toFixed(2)}\n🛒 Total do carrinho: R$ ${cart.total.toFixed(2)}`,
        flags: 64,
      },
    };
  }

  removeFromCart(userId: string, mapId: number) {
    const cart = this.userCarts.get(userId);

    if (!cart) {
      return {
        type: 4,
        data: {
          content: "❌ Carrinho não encontrado",
          flags: 64,
        },
      };
    }

    const itemIndex = cart.items.findIndex((item) => item.mapId === mapId);

    if (itemIndex === -1) {
      return {
        type: 4,
        data: {
          content: "❌ Item não encontrado no carrinho",
          flags: 64,
        },
      };
    }

    const removedItem = cart.items[itemIndex];
    cart.items.splice(itemIndex, 1);
    this.updateCartTotal(cart);

    return {
      type: 4,
      data: {
        content: `✅ **${removedItem.name}** removido do carrinho!\n\n🛒 Total do carrinho: R$ ${cart.total.toFixed(2)}`,
        flags: 64,
      },
    };
  }

  updateQuantity(userId: string, mapId: number, quantity: number) {
    const cart = this.userCarts.get(userId);

    if (!cart) {
      return {
        type: 4,
        data: {
          content: "❌ Carrinho não encontrado",
          flags: 64,
        },
      };
    }

    const item = cart.items.find((item) => item.mapId === mapId);

    if (!item) {
      return {
        type: 4,
        data: {
          content: "❌ Item não encontrado no carrinho",
          flags: 64,
        },
      };
    }

    if (quantity <= 0) {
      return this.removeFromCart(userId, mapId);
    }

    item.quantity = quantity;
    this.updateCartTotal(cart);

    return {
      type: 4,
      data: {
        content: `✅ Quantidade de **${item.name}** atualizada para ${quantity}!\n\n🛒 Total do carrinho: R$ ${cart.total.toFixed(2)}`,
        flags: 64,
      },
    };
  }

  clearCart(userId: string) {
    const cart = this.userCarts.get(userId);

    if (!cart || cart.items.length === 0) {
      return {
        type: 4,
        data: {
          content: "❌ Seu carrinho já está vazio",
          flags: 64,
        },
      };
    }

    cart.items = [];
    cart.total = 0;

    return {
      type: 4,
      data: {
        content: "✅ Carrinho limpo com sucesso!",
        flags: 64,
      },
    };
  }

  getCart(userId: string): UserCart | undefined {
    return this.userCarts.get(userId);
  }

  private updateCartTotal(cart: UserCart) {
    cart.total = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }
}
