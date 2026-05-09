import { injectable } from "tsyringe";

interface CheckoutData {
  userId: string;
  total: number;
  items: Array<{ name: string; price: number; quantity: number }>;
  paymentMethod?: "pix" | "stripe";
}

@injectable()
export class CheckoutCommand {
  private checkouts: Map<string, CheckoutData> = new Map();

  handleCheckout(userId: string, total: number, items: any[]) {
    const checkoutId = `checkout-${userId}-${Date.now()}`;
    const checkoutData: CheckoutData = { userId, total, items };

    this.checkouts.set(checkoutId, checkoutData);

    return {
      type: 4,
      data: {
        embeds: [
          {
            title: "💳 Escolha o Método de Pagamento",
            description: `Total a pagar: **R$ ${total.toFixed(2)}**\n\nEscolha como deseja pagar:`,
            color: 0x8b5cf6,
            fields: [
              {
                name: "🔑 PIX",
                value: "Pagamento instantâneo via PIX (recomendado)",
                inline: false,
              },
              {
                name: "💳 Cartão de Crédito",
                value: "Pagamento com Stripe (parcelado em até 12x)",
                inline: false,
              },
            ],
            footer: {
              text: "Clique no botão correspondente ao seu método de pagamento",
            },
          },
        ],
        components: [
          {
            type: 1,
            components: [
              {
                type: 2,
                label: "🔑 Pagar com PIX",
                custom_id: `btn-pay-pix-${checkoutId}`,
                style: 3, // Green
              },
              {
                type: 2,
                label: "💳 Pagar com Cartão",
                custom_id: `btn-pay-stripe-${checkoutId}`,
                style: 1, // Primary
              },
            ],
          },
        ],
      },
    };
  }

  handlePixPayment(userId: string, checkoutId: string, total: number) {
    // Simular geração de QR Code PIX
    const pixQrCode = this.generatePixQrCode(userId, total);
    const pixKey = "703.421.081-07";

    return {
      type: 4,
      data: {
        embeds: [
          {
            title: "🔑 Pagamento via PIX",
            description: "Escaneie o QR Code abaixo ou copie a chave PIX",
            color: 0x10b981,
            image: {
              url: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(pixQrCode)}`,
            },
            fields: [
              {
                name: "💰 Valor",
                value: `**R$ ${total.toFixed(2)}**`,
                inline: true,
              },
              {
                name: "⏱️ Vencimento",
                value: "30 minutos",
                inline: true,
              },
              {
                name: "🔑 Chave PIX (CPF)",
                value: `\`${pixKey}\``,
                inline: false,
              },
              {
                name: "📋 Referência",
                value: `\`${checkoutId}\``,
                inline: false,
              },
            ],
            footer: {
              text: "Após confirmar o pagamento, você receberá os arquivos automaticamente",
            },
          },
        ],
        components: [
          {
            type: 1,
            components: [
              {
                type: 2,
                label: "✅ Já Paguei",
                custom_id: `btn-confirm-pix-${checkoutId}`,
                style: 3, // Green
              },
              {
                type: 2,
                label: "❌ Cancelar",
                custom_id: "btn-cancel-checkout",
                style: 4, // Danger
              },
            ],
          },
        ],
      },
    };
  }

  handleStripePayment(userId: string, checkoutId: string, total: number) {
    // Simular geração de link Stripe
    const stripeLink = `https://checkout.stripe.com/pay/cs_test_${Math.random().toString(36).substring(7)}`;

    return {
      type: 4,
      data: {
        embeds: [
          {
            title: "💳 Pagamento com Cartão",
            description: "Clique no botão abaixo para ir para o checkout seguro do Stripe",
            color: 0x635bff,
            fields: [
              {
                name: "💰 Valor",
                value: `**R$ ${total.toFixed(2)}**`,
                inline: true,
              },
              {
                name: "🔒 Segurança",
                value: "SSL Encriptado",
                inline: true,
              },
              {
                name: "📋 Referência",
                value: `\`${checkoutId}\``,
                inline: false,
              },
            ],
            footer: {
              text: "Você será redirecionado para o Stripe para completar o pagamento",
            },
          },
        ],
        components: [
          {
            type: 1,
            components: [
              {
                type: 2,
                label: "💳 Ir para Stripe",
                custom_id: `btn-stripe-redirect-${checkoutId}`,
                style: 1, // Primary
                url: stripeLink,
              },
              {
                type: 2,
                label: "❌ Cancelar",
                custom_id: "btn-cancel-checkout",
                style: 4, // Danger
              },
            ],
          },
        ],
      },
    };
  }

  handlePaymentConfirmation(userId: string, checkoutId: string, paymentMethod: "pix" | "stripe") {
    const checkout = this.checkouts.get(checkoutId);

    if (!checkout) {
      return {
        type: 4,
        data: {
          content: "❌ Checkout não encontrado",
          flags: 64,
        },
      };
    }

    const itemsList = checkout.items
      .map((item) => `• ${item.name} x${item.quantity}`)
      .join("\n");

    return {
      type: 4,
      data: {
        embeds: [
          {
            title: "✅ Pagamento Confirmado!",
            description: `Seu pedido foi confirmado com sucesso!\n\n**Itens:**\n${itemsList}`,
            color: 0x10b981,
            fields: [
              {
                name: "💰 Total Pago",
                value: `R$ ${checkout.total.toFixed(2)}`,
                inline: true,
              },
              {
                name: "💳 Método",
                value: paymentMethod === "pix" ? "🔑 PIX" : "💳 Cartão",
                inline: true,
              },
              {
                name: "📦 Entrega",
                value: "Os arquivos serão enviados em breve via DM",
                inline: false,
              },
            ],
            footer: {
              text: `Pedido ID: ${checkoutId}`,
            },
          },
        ],
      },
    };
  }

  private generatePixQrCode(userId: string, total: number): string {
    // Simular geração de QR Code PIX
    // Em produção, isso seria integrado com MercadoPago ou similar
    return `00020126580014br.gov.bcb.pix0136703.421.081-07${total.toFixed(2)}5204000053039865802BR5913BOREAS6009SAO PAULO62410503***63041D3D`;
  }
}
