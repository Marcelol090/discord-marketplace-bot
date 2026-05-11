export default {
  translation: {
    shop: {
      title: "🛍️ Marketplace - Bem-vindo!",
      description: "Explore nossos produtos incríveis. Selecione uma categoria abaixo para começar suas compras!",
      products: "📦 Produtos Disponíveis",
      productsCount: "{{count}} produtos para você escolher",
      categories: "🏷️ Categorias",
      categoriesCount: "{{count}} categorias diferentes",
      payment: "💳 Pagamento Seguro",
      paymentDesc: "PIX e Cartão de Crédito disponíveis",
      footer: "Clique no select menu abaixo para explorar categorias",
      placeholder: "Selecione uma categoria",
      error: "❌ Erro ao carregar a loja. Tente novamente mais tarde.",
      empty: "📦 Nenhum produto disponível nesta categoria",
      price: "💵 Preço",
      stock: "📋 Estoque",
      stockAvailable: "✅ {{count}} unidades",
      stockUnavailable: "❌ Esgotado",
      rating: "⭐ Avaliação",
      ratingValue: "5.0 (100% recomendado)",
      addToCart: "Adicionar ao Carrinho",
      invalidCategory: "❌ Categoria inválida",
      errorProducts: "❌ Erro ao carregar produtos. Tente novamente.",
      productFooter: "ID: {{id}} | Clique no botão para adicionar ao carrinho"
    },
    cart: {
      title: "🛒 Seu Carrinho",
      totalItems: "Total de itens: {{count}}",
      productId: "Produto ID: {{id}}",
      quantity: "Quantidade: {{count}}",
      empty: "🛒 Seu carrinho está vazio!",
      error: "❌ Erro ao carregar o carrinho. Tente novamente mais tarde.",
      addSuccess: "✅ Produto adicionado ao carrinho!",
      addError: "❌ Erro ao adicionar ao carrinho. Tente novamente.",
      removeSuccess: "✅ Produto removido do carrinho!",
      removeError: "❌ Erro ao remover do carrinho. Tente novamente."
    },
    checkout: {
      title: "💳 Checkout",
      total: "Total a pagar: **R$ {{total}}**",
      items: "Itens",
      itemsCount: "{{count}} produto(s)",
      selectMethod: "Escolha como deseja pagar:",
      error: "❌ Erro ao iniciar checkout. Tente novamente.",
      empty: "❌ Seu carrinho está vazio! Use `/shop` para adicionar produtos.",
      pixTitle: "🔑 Pagamento via PIX",
      pixDesc: "Escaneie o QR Code abaixo ou copie a chave PIX",
      pixValue: "**R$ {{total}}**",
      pixExpiry: "30 minutos",
      pixOrder: "`#{{id}}`",
      pixCopyPaste: "`{{key}}`",
      pixFooter: "Após confirmar o pagamento, você receberá os arquivos automaticamente",
      pixError: "❌ Erro no pagamento PIX. Tente novamente.",
      pixQrError: "❌ Erro ao gerar QR Code PIX. Tente novamente.",
      cardSuccessTitle: "✅ Pagamento Confirmado!",
      cardSuccessDesc: "Seu pedido **#{{id}}** foi confirmado com sucesso!",
      cardMethod: "Cartão de Crédito",
      cardDelivery: "Os arquivos serão enviados em breve via DM",
      cardError: "❌ Erro no pagamento com cartão. Tente novamente.",
      cardFailed: "❌ Falha no pagamento: {{error}}"
    },
    orders: {
      title: "📦 Meus Pedidos",
      empty: "📦 Você não tem pedidos ainda!",
      id: "Pedido #{{id}}",
      status: "Status: {{status}}\nTotal: R$ {{total}}",
      error: "❌ Erro ao carregar pedidos. Tente novamente mais tarde."
    },
    common: {
      userError: "❌ Erro ao identificar o usuário",
      unknownCommand: "Comando desconhecido: {{command}}",
      notHandled: "Interação não tratada"
    }
  }
};