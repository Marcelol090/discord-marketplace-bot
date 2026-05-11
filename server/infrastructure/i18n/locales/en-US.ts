export default {
  translation: {
    shop: {
      title: "🛍️ Marketplace - Welcome!",
      description: "Explore our amazing products. Select a category below to start shopping!",
      products: "📦 Available Products",
      productsCount: "{{count}} products to choose from",
      categories: "🏷️ Categories",
      categoriesCount: "{{count}} different categories",
      payment: "💳 Secure Payment",
      paymentDesc: "PIX and Credit Card available",
      footer: "Click the select menu below to explore categories",
      placeholder: "Select a category",
      error: "❌ Error loading the shop. Please try again later.",
      empty: "📦 No products available in this category",
      price: "💵 Price",
      stock: "📋 Stock",
      stockAvailable: "✅ {{count}} units",
      stockUnavailable: "❌ Out of stock",
      rating: "⭐ Rating",
      ratingValue: "5.0 (100% recommended)",
      addToCart: "Add to Cart",
      invalidCategory: "❌ Invalid category",
      errorProducts: "❌ Error loading products. Please try again.",
      productFooter: "ID: {{id}} | Click the button to add to cart"
    },
    cart: {
      title: "🛒 Your Cart",
      totalItems: "Total items: {{count}}",
      productId: "Product ID: {{id}}",
      quantity: "Quantity: {{count}}",
      empty: "🛒 Your cart is empty!",
      error: "❌ Error loading the cart. Please try again later.",
      addSuccess: "✅ Product added to cart!",
      addError: "❌ Error adding to cart. Please try again.",
      removeSuccess: "✅ Product removed from cart!",
      removeError: "❌ Error removing from cart. Please try again."
    },
    checkout: {
      title: "💳 Checkout",
      total: "Total to pay: **R$ {{total}}**",
      items: "Items",
      itemsCount: "{{count}} product(s)",
      selectMethod: "Choose how you want to pay:",
      error: "❌ Error starting checkout. Please try again.",
      empty: "❌ Your cart is empty! Use `/shop` to add products.",
      pixTitle: "🔑 Payment via PIX",
      pixDesc: "Scan the QR Code below or copy the PIX key",
      pixValue: "**R$ {{total}}**",
      pixExpiry: "30 minutes",
      pixOrder: "`#{{id}}`",
      pixCopyPaste: "`{{key}}`",
      pixFooter: "After confirming payment, you will receive the files automatically",
      pixError: "❌ PIX payment error. Please try again.",
      pixQrError: "❌ Error generating PIX QR Code. Please try again.",
      cardSuccessTitle: "✅ Payment Confirmed!",
      cardSuccessDesc: "Your order **#{{id}}** has been successfully confirmed!",
      cardMethod: "Credit Card",
      cardDelivery: "The files will be sent shortly via DM",
      cardError: "❌ Credit card payment error. Please try again.",
      cardFailed: "❌ Payment failed: {{error}}"
    },
    orders: {
      title: "📦 My Orders",
      empty: "📦 You don't have any orders yet!",
      id: "Order #{{id}}",
      status: "Status: {{status}}\nTotal: R$ {{total}}",
      error: "❌ Error loading orders. Please try again later."
    },
    common: {
      userError: "❌ Error identifying the user",
      unknownCommand: "Unknown command: {{command}}",
      notHandled: "Interaction not handled"
    }
  }
};