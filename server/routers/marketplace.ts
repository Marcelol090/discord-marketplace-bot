import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { container } from "../infrastructure/di/container";
import { ProductService } from "../domain/services/ProductService";
import { CategoryService } from "../domain/services/CategoryService";
import { CartService } from "../domain/services/CartService";
import { OrderService } from "../domain/services/OrderService";
import { PaymentService } from "../domain/services/PaymentService";

const productService = container.resolve(ProductService);
const categoryService = container.resolve(CategoryService);
const cartService = container.resolve(CartService);
const orderService = container.resolve(OrderService);
const paymentService = container.resolve(PaymentService);

export const marketplaceRouter = router({
  // Products
  products: router({
    list: publicProcedure.query(async () => {
      return await productService.getActiveProducts();
    }),

    listAll: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user?.role !== "admin") {
        throw new Error("Unauthorized");
      }
      return await productService.getAllProducts();
    }),

    getById: publicProcedure.input(z.number()).query(async ({ input }) => {
      return await productService.getProductById(input);
    }),

    getByCategory: publicProcedure.input(z.number()).query(async ({ input }) => {
      return await productService.getProductsByCategory(input);
    }),

    create: protectedProcedure
      .input(
        z.object({
          categoryId: z.number(),
          name: z.string(),
          description: z.string().optional(),
          price: z.string(),
          stock: z.number().optional(),
          imageUrl: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        if (ctx.user?.role !== "admin") {
          throw new Error("Unauthorized");
        }
        return await productService.createProduct(input);
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          categoryId: z.number().optional(),
          name: z.string().optional(),
          description: z.string().optional(),
          price: z.string().optional(),
          stock: z.number().optional(),
          imageUrl: z.string().optional(),
          isActive: z.boolean().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        if (ctx.user?.role !== "admin") {
          throw new Error("Unauthorized");
        }
        const { id, ...data } = input;
        return await productService.updateProduct(id, data);
      }),

    delete: protectedProcedure
      .input(z.number())
      .mutation(async ({ input, ctx }) => {
        if (ctx.user?.role !== "admin") {
          throw new Error("Unauthorized");
        }
        await productService.deleteProduct(input);
        return { success: true };
      }),
  }),

  // Categories
  categories: router({
    list: publicProcedure.query(async () => {
      return await categoryService.getAllCategories();
    }),

    getById: publicProcedure.input(z.number()).query(async ({ input }) => {
      return await categoryService.getCategoryById(input);
    }),

    create: protectedProcedure
      .input(
        z.object({
          name: z.string(),
          description: z.string().optional(),
          emoji: z.string().optional(),
          order: z.number().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        if (ctx.user?.role !== "admin") {
          throw new Error("Unauthorized");
        }
        return await categoryService.createCategory(input);
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          name: z.string().optional(),
          description: z.string().optional(),
          emoji: z.string().optional(),
          order: z.number().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        if (ctx.user?.role !== "admin") {
          throw new Error("Unauthorized");
        }
        const { id, ...data } = input;
        return await categoryService.updateCategory(id, data);
      }),

    delete: protectedProcedure
      .input(z.number())
      .mutation(async ({ input, ctx }) => {
        if (ctx.user?.role !== "admin") {
          throw new Error("Unauthorized");
        }
        await categoryService.deleteCategory(input);
        return { success: true };
      }),
  }),

  // Cart
  cart: router({
    get: protectedProcedure.query(async ({ ctx }) => {
      const cart = await cartService.getCart(ctx.user!.id);
      return {
        items: cart.getItems(),
        total: await cartService.getCartTotal(ctx.user!.id),
      };
    }),

    addItem: protectedProcedure
      .input(
        z.object({
          productId: z.number(),
          quantity: z.number().default(1),
        })
      )
      .mutation(async ({ input, ctx }) => {
        await cartService.addToCart(ctx.user!.id, input.productId, input.quantity);
        return { success: true };
      }),

    removeItem: protectedProcedure
      .input(z.number())
      .mutation(async ({ input, ctx }) => {
        await cartService.removeFromCart(ctx.user!.id, input);
        return { success: true };
      }),

    updateQuantity: protectedProcedure
      .input(
        z.object({
          productId: z.number(),
          quantity: z.number(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        await cartService.updateCartItemQuantity(
          ctx.user!.id,
          input.productId,
          input.quantity
        );
        return { success: true };
      }),

    clear: protectedProcedure.mutation(async ({ ctx }) => {
      await cartService.clearCart(ctx.user!.id);
      return { success: true };
    }),
  }),

  // Orders
  orders: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return await orderService.getOrdersByUserId(ctx.user!.id);
    }),

    getById: protectedProcedure
      .input(z.number())
      .query(async ({ input, ctx }) => {
        const order = await orderService.getOrderById(input);
        if (order?.userId !== ctx.user!.id && ctx.user?.role !== "admin") {
          throw new Error("Unauthorized");
        }
        return order;
      }),

    create: protectedProcedure
      .input(
        z.object({
          totalAmount: z.string(),
          paymentMethod: z.enum(["pix", "credit_card"]),
          shippingAddress: z.object({
            street: z.string(),
            number: z.string(),
            complement: z.string().optional(),
            city: z.string(),
            state: z.string(),
            zipCode: z.string(),
            country: z.string().default("BR"),
          }),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const order = await orderService.createOrder({
          userId: ctx.user!.id,
          discordUserId: ctx.user!.openId,
          totalAmount: input.totalAmount,
          paymentMethod: input.paymentMethod,
          shippingAddress: input.shippingAddress,
          notes: input.notes,
        });

        // Clear cart after order creation
        await cartService.clearCart(ctx.user!.id);

        return order;
      }),

    updateStatus: protectedProcedure
      .input(
        z.object({
          orderId: z.number(),
          status: z.enum(["pending", "paid", "processing", "shipped", "delivered", "cancelled"]),
        })
      )
      .mutation(async ({ input, ctx }) => {
        if (ctx.user?.role !== "admin") {
          throw new Error("Unauthorized");
        }

        switch (input.status) {
          case "paid":
            return await orderService.markOrderAsPaid(input.orderId, "");
          case "processing":
            return await orderService.markOrderAsProcessing(input.orderId);
          case "shipped":
            return await orderService.markOrderAsShipped(input.orderId, "");
          case "delivered":
            return await orderService.markOrderAsDelivered(input.orderId);
          case "cancelled":
            return await orderService.cancelOrder(input.orderId);
          default:
            throw new Error("Invalid status");
        }
      }),
  }),

  // Payments
  payments: router({
    generatePixQrCode: protectedProcedure
      .input(
        z.object({
          amount: z.string(),
          description: z.string(),
          orderId: z.number(),
        })
      )
      .mutation(async ({ input }) => {
        return await paymentService.generatePixQrCode(input);
      }),

    processCardPayment: protectedProcedure
      .input(
        z.object({
          amount: z.string(),
          description: z.string(),
          orderId: z.number(),
          token: z.string(),
        })
      )
      .mutation(async ({ input }) => {
        return await paymentService.processCardPayment(input);
      }),

    verifyPaymentStatus: protectedProcedure
      .input(z.string())
      .query(async ({ input }) => {
        const isVerified = await paymentService.verifyPaymentStatus(input);
        return { verified: isVerified };
      }),
  }),
});
