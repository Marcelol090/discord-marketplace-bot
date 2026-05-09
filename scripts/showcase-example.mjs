/**
 * Exemplo de Vitrine de Produtos para Discord
 * Este arquivo demonstra como os embeds interativos aparecem no Discord
 */

const showcaseExample = {
  type: 4, // CHANNEL_MESSAGE_WITH_SOURCE
  data: {
    content: "🛍️ **Bem-vindo à Vitrine de Produtos!**\n\nEscolha uma categoria ou navegue pelos produtos disponíveis.",
    embeds: [
      {
        title: "🎮 Jogos",
        description: "Jogos e softwares premium",
        color: 0x3b82f6, // Azul
        thumbnail: {
          url: "https://via.placeholder.com/100x100?text=Jogos",
        },
        fields: [
          {
            name: "📊 Produtos Disponíveis",
            value: "2 produtos",
            inline: true,
          },
          {
            name: "💰 Preço Inicial",
            value: "R$ 49,99",
            inline: true,
          },
        ],
      },
      {
        title: "📚 Cursos",
        description: "Cursos online e treinamentos",
        color: 0x10b981, // Verde
        thumbnail: {
          url: "https://via.placeholder.com/100x100?text=Cursos",
        },
        fields: [
          {
            name: "📊 Produtos Disponíveis",
            value: "2 produtos",
            inline: true,
          },
          {
            name: "💰 Preço Inicial",
            value: "R$ 79,99",
            inline: true,
          },
        ],
      },
      {
        title: "🎨 Design",
        description: "Recursos de design e templates",
        color: 0xf59e0b, // Âmbar
        thumbnail: {
          url: "https://via.placeholder.com/100x100?text=Design",
        },
        fields: [
          {
            name: "📊 Produtos Disponíveis",
            value: "2 produtos",
            inline: true,
          },
          {
            name: "💰 Preço Inicial",
            value: "R$ 29,99",
            inline: true,
          },
        ],
      },
    ],
    components: [
      {
        type: 1, // Action Row
        components: [
          {
            type: 3, // Select Menu
            custom_id: "select-category",
            placeholder: "Escolha uma categoria",
            options: [
              {
                label: "🎮 Jogos",
                value: "category-1",
                description: "Jogos e softwares",
              },
              {
                label: "📚 Cursos",
                value: "category-2",
                description: "Cursos online",
              },
              {
                label: "🎨 Design",
                value: "category-3",
                description: "Design e templates",
              },
              {
                label: "💻 Desenvolvimento",
                value: "category-4",
                description: "Ferramentas de dev",
              },
              {
                label: "🎵 Música",
                value: "category-5",
                description: "Áudios e loops",
              },
            ],
          },
        ],
      },
    ],
  },
};

const productDetailExample = {
  type: 4,
  data: {
    embeds: [
      {
        title: "🎮 Jogo Premium - Aventura Épica",
        description: "Um jogo de aventura emocionante com gráficos incríveis",
        color: 0x3b82f6,
        image: {
          url: "https://via.placeholder.com/600x300?text=Jogo+Premium",
        },
        fields: [
          {
            name: "💰 Preço",
            value: "**R$ 99,99**",
            inline: true,
          },
          {
            name: "📦 Estoque",
            value: "✅ 50 unidades",
            inline: true,
          },
          {
            name: "📝 Descrição Completa",
            value: "Um jogo de aventura emocionante com gráficos incríveis, gameplay envolvente e história cativante. Perfeito para jogadores que buscam uma experiência imersiva.",
            inline: false,
          },
          {
            name: "⭐ Avaliação",
            value: "4.8/5.0 (1.2k avaliações)",
            inline: true,
          },
          {
            name: "🎯 Categoria",
            value: "Jogos",
            inline: true,
          },
        ],
        footer: {
          text: "ID do Produto: 1 | Clique em 'Comprar Agora' para adicionar ao carrinho",
        },
      },
    ],
    components: [
      {
        type: 1,
        components: [
          {
            type: 2, // Button
            label: "🛒 Adicionar ao Carrinho",
            custom_id: "btn-add-cart-product-1",
            style: 3, // Green
          },
          {
            type: 2,
            label: "💳 Comprar Agora",
            custom_id: "btn-buy-product-1",
            style: 1, // Primary (Blue)
          },
        ],
      },
      {
        type: 1,
        components: [
          {
            type: 2,
            label: "⬅️ Anterior",
            custom_id: "btn-prev-page",
            style: 2, // Secondary
          },
          {
            type: 2,
            label: "➡️ Próximo",
            custom_id: "btn-next-page",
            style: 2,
          },
          {
            type: 2,
            label: "🏠 Voltar à Vitrine",
            custom_id: "btn-back-to-shop",
            style: 2,
          },
        ],
      },
    ],
  },
};

const cartExample = {
  type: 4,
  data: {
    embeds: [
      {
        title: "🛒 Seu Carrinho",
        description: "Você tem 2 itens no carrinho",
        color: 0x10b981,
        fields: [
          {
            name: "📦 Item 1: Jogo Premium - Aventura Épica",
            value: "Quantidade: 1 | Preço: R$ 99,99",
            inline: false,
          },
          {
            name: "📦 Item 2: Curso de React Avançado",
            value: "Quantidade: 1 | Preço: R$ 129,99",
            inline: false,
          },
          {
            name: "💰 Subtotal",
            value: "R$ 229,98",
            inline: true,
          },
          {
            name: "🚚 Frete",
            value: "Grátis",
            inline: true,
          },
          {
            name: "📊 Total",
            value: "**R$ 229,98**",
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
            label: "🛍️ Continuar Comprando",
            custom_id: "btn-continue-shopping",
            style: 2,
          },
          {
            type: 2,
            label: "💳 Ir para Checkout",
            custom_id: "btn-checkout",
            style: 3, // Green
          },
        ],
      },
    ],
  },
};

const checkoutExample = {
  type: 4,
  data: {
    embeds: [
      {
        title: "💳 Checkout",
        description: "Escolha seu método de pagamento",
        color: 0xf59e0b,
        fields: [
          {
            name: "📊 Resumo do Pedido",
            value: "2 itens | Total: R$ 229,98",
            inline: false,
          },
          {
            name: "💰 Métodos de Pagamento",
            value: "Escolha uma opção abaixo",
            inline: false,
          },
        ],
      },
    ],
    components: [
      {
        type: 1,
        components: [
          {
            type: 2,
            label: "💳 PIX",
            custom_id: "payment-pix",
            style: 3, // Green
          },
          {
            type: 2,
            label: "🏦 Cartão de Crédito",
            custom_id: "payment-card",
            style: 1, // Primary
          },
        ],
      },
    ],
  },
};

const pixConfirmationExample = {
  type: 4,
  data: {
    embeds: [
      {
        title: "✅ PIX Gerado com Sucesso!",
        description: "Escaneie o QR Code abaixo para confirmar o pagamento",
        color: 0x10b981,
        image: {
          url: "https://via.placeholder.com/300x300?text=QR+Code+PIX",
        },
        fields: [
          {
            name: "📱 Referência",
            value: "`REF-ORDER-123456`",
            inline: false,
          },
          {
            name: "💰 Valor",
            value: "R$ 229,98",
            inline: true,
          },
          {
            name: "⏱️ Validade",
            value: "15 minutos",
            inline: true,
          },
          {
            name: "📝 Instruções",
            value: "1. Abra seu app bancário\n2. Selecione PIX\n3. Escaneie o QR Code\n4. Confirme o pagamento",
            inline: false,
          },
        ],
        footer: {
          text: "O pedido será confirmado automaticamente após o pagamento",
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
            custom_id: "btn-confirm-payment",
            style: 3,
          },
          {
            type: 2,
            label: "❌ Cancelar",
            custom_id: "btn-cancel-payment",
            style: 4, // Red
          },
        ],
      },
    ],
  },
};

const orderConfirmationExample = {
  type: 4,
  data: {
    embeds: [
      {
        title: "🎉 Pedido Confirmado!",
        description: "Seu pedido foi processado com sucesso",
        color: 0x10b981,
        fields: [
          {
            name: "📦 Número do Pedido",
            value: "#ORDER-123456",
            inline: true,
          },
          {
            name: "📅 Data",
            value: "06/05/2026 09:15",
            inline: true,
          },
          {
            name: "💰 Total Pago",
            value: "R$ 229,98",
            inline: true,
          },
          {
            name: "📊 Status",
            value: "✅ Pagamento Confirmado",
            inline: true,
          },
          {
            name: "📦 Itens",
            value: "• Jogo Premium - Aventura Épica\n• Curso de React Avançado",
            inline: false,
          },
          {
            name: "📧 Confirmação",
            value: "Um email de confirmação foi enviado para seu email cadastrado",
            inline: false,
          },
        ],
        footer: {
          text: "Obrigado por sua compra! Acompanhe seu pedido com /orders",
        },
      },
    ],
    components: [
      {
        type: 1,
        components: [
          {
            type: 2,
            label: "📦 Acompanhar Pedido",
            custom_id: "btn-track-order",
            style: 1,
          },
          {
            type: 2,
            label: "🛍️ Voltar à Vitrine",
            custom_id: "btn-back-to-shop",
            style: 2,
          },
        ],
      },
    ],
  },
};

console.log("📋 EXEMPLOS DE EMBEDS INTERATIVOS PARA DISCORD\n");
console.log("=" .repeat(60));

console.log("\n1️⃣ VITRINE DE CATEGORIAS:");
console.log(JSON.stringify(showcaseExample, null, 2));

console.log("\n\n2️⃣ DETALHE DO PRODUTO:");
console.log(JSON.stringify(productDetailExample, null, 2));

console.log("\n\n3️⃣ CARRINHO DE COMPRAS:");
console.log(JSON.stringify(cartExample, null, 2));

console.log("\n\n4️⃣ CHECKOUT:");
console.log(JSON.stringify(checkoutExample, null, 2));

console.log("\n\n5️⃣ CONFIRMAÇÃO PIX:");
console.log(JSON.stringify(pixConfirmationExample, null, 2));

console.log("\n\n6️⃣ PEDIDO CONFIRMADO:");
console.log(JSON.stringify(orderConfirmationExample, null, 2));

console.log("\n" + "=".repeat(60));
console.log("✨ Exemplos de embeds gerados com sucesso!");
console.log("💡 Estes embeds são enviados automaticamente pelo bot");
console.log("🎯 Cada embed tem botões e select menus interativos");
