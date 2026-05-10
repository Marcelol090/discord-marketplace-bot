import { router, adminProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { orders, products, orderItems, paymentTransactions, users } from "../../drizzle/schema";
import { eq, desc, and, gte, lte } from "drizzle-orm";

export const adminRouter = router({
  /**
   * Get dashboard metrics
   */
  getDashboardMetrics: adminProcedure.query(async (opts) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Get total orders
    const allOrders = await db.select().from(orders);
    const totalOrders = allOrders.length;

    // Get paid orders
    const paidOrders = allOrders.filter((o) => o.status === "paid" || o.status === "shipped" || o.status === "delivered");
    const totalRevenue = paidOrders.reduce((sum, o) => sum + parseFloat(o.totalAmount.toString()), 0);

    // Get pending orders
    const pendingOrders = allOrders.filter((o) => o.status === "pending");
    const pendingCount = pendingOrders.length;

    // Get delivered orders
    const deliveredOrders = allOrders.filter((o) => o.status === "delivered");
    const deliveredCount = deliveredOrders.length;

    // Get digital delivery stats
    const pendingDelivery = allOrders.filter((o) => o.deliveryStatus === "pending").length;
    const failedDelivery = allOrders.filter((o) => o.deliveryStatus === "failed").length;

    // Get total products
    const allProducts = await db.select().from(products);
    const totalProducts = allProducts.length;
    const activeProducts = allProducts.filter((p) => p.isActive).length;
    const digitalProducts = allProducts.filter((p) => p.isDigital).length;

    // Get total users
    const totalUsers = await db.select().from(users);

    return {
      totalOrders,
      totalRevenue: totalRevenue.toFixed(2),
      pendingOrders: pendingCount,
      deliveredOrders: deliveredCount,
      totalProducts,
      activeProducts,
      digitalProducts,
      totalUsers: totalUsers.length,
      digitalDeliveryStats: {
        pending: pendingDelivery,
        failed: failedDelivery,
      },
    };
  }),

  /**
   * Get all orders with pagination and filtering
   */
  getOrders: adminProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(20),
        status: z.enum(["pending", "paid", "processing", "shipped", "delivered", "cancelled"]).optional(),
        deliveryStatus: z.enum(["pending", "sent", "failed"]).optional(),
        paymentMethod: z.enum(["pix", "credit_card"]).optional(),
      })
    )
    .query(async (opts: any) => {
      const input = opts.input;
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Get all orders first
      let allOrders = await db.select().from(orders);

      // Apply filters in memory
      if (input.status) {
        allOrders = allOrders.filter((o) => o.status === input.status);
      }
      if (input.deliveryStatus) {
        allOrders = allOrders.filter((o) => o.deliveryStatus === input.deliveryStatus);
      }
      if (input.paymentMethod) {
        allOrders = allOrders.filter((o) => o.paymentMethod === input.paymentMethod);
      }
      const total = allOrders.length;

      // Apply pagination
      const offset = (input.page - 1) * input.limit;
      const paginatedOrders = allOrders
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(offset, offset + input.limit);

      return {
        orders: paginatedOrders.map((o) => ({
          id: o.id,
          discordUserId: o.discordUserId,
          status: o.status,
          totalAmount: o.totalAmount.toString(),
          paymentMethod: o.paymentMethod,
          deliveryStatus: o.deliveryStatus,
          createdAt: o.createdAt,
          updatedAt: o.updatedAt,
          lastDeliveryAttempt: o.lastDeliveryAttempt,
          deliveryAttempts: o.deliveryAttempts,
        })),
        pagination: {
          page: input.page,
          limit: input.limit,
          total,
          pages: Math.ceil(total / input.limit),
        },
      };
    }),

  /**
   * Get order details with items
   */
  getOrderDetails: adminProcedure
    .input(z.object({ orderId: z.number() }))
    .query(async (opts: any) => {
      const input = opts.input;
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const order = await db.select().from(orders).where(eq(orders.id, input.orderId)).limit(1);

      if (!order || order.length === 0) {
        throw new Error("Order not found");
      }

      const items = await db.select().from(orderItems).where(eq(orderItems.orderId, input.orderId));

      // Get product details for each item
      const itemsWithDetails = await Promise.all(
        items.map(async (item) => {
          const product = await db.select().from(products).where(eq(products.id, item.productId)).limit(1);
          return {
            ...item,
            product: product[0] || null,
          };
        })
      );

      return {
        order: order[0],
        items: itemsWithDetails,
      };
    }),

  /**
   * Update order status
   */
  updateOrderStatus: adminProcedure
    .input(
      z.object({
        orderId: z.number(),
        status: z.enum(["pending", "paid", "processing", "shipped", "delivered", "cancelled"]),
      })
    )
    .mutation(async (opts: any) => {
      const input = opts.input;
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db.update(orders).set({ status: input.status, updatedAt: new Date() }).where(eq(orders.id, input.orderId));

      return { success: true };
    }),

  /**
   * Retry digital delivery for an order
   */
  retryDigitalDelivery: adminProcedure
    .input(z.object({ orderId: z.number() }))
    .mutation(async (opts: any) => {
      const input = opts.input;
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const order = await db.select().from(orders).where(eq(orders.id, input.orderId)).limit(1);

      if (!order || order.length === 0) {
        throw new Error("Order not found");
      }

      // Reset delivery status to pending for retry
      await db
        .update(orders)
        .set({
          deliveryStatus: "pending",
          lastDeliveryAttempt: new Date(),
        })
        .where(eq(orders.id, input.orderId));

      return { success: true, message: "Delivery retry scheduled" };
    }),

  /**
   * Get all products with stock levels
   */
  getProducts: adminProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(20),
        isActive: z.boolean().optional(),
        isDigital: z.boolean().optional(),
      })
    )
    .query(async (opts: any) => {
      const input = opts.input;
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      let allProducts = await db.select().from(products);

      // Apply filters
      if (input.isActive !== undefined) {
        allProducts = allProducts.filter((p) => p.isActive === input.isActive);
      }
      if (input.isDigital !== undefined) {
        allProducts = allProducts.filter((p) => p.isDigital === input.isDigital);
      }

      const total = allProducts.length;
      const offset = (input.page - 1) * input.limit;
      const paginatedProducts = allProducts.slice(offset, offset + input.limit);

      return {
        products: paginatedProducts.map((p) => ({
          id: p.id,
          name: p.name,
          price: p.price.toString(),
          stock: p.stock,
          isActive: p.isActive,
          isDigital: p.isDigital,
          assetKey: p.assetKey,
          imageUrl: p.imageUrl,
          createdAt: p.createdAt,
        })),
        pagination: {
          page: input.page,
          limit: input.limit,
          total,
          pages: Math.ceil(total / input.limit),
        },
      };
    }),

  /**
   * Update product stock
   */
  updateProductStock: adminProcedure
    .input(
      z.object({
        productId: z.number(),
        stock: z.number().min(0),
      })
    )
    .mutation(async (opts: any) => {
      const input = opts.input;
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db
        .update(products)
        .set({ stock: input.stock, updatedAt: new Date() })
        .where(eq(products.id, input.productId));

      return { success: true };
    }),

  /**
   * Update product price
   */
  updateProductPrice: adminProcedure
    .input(
      z.object({
        productId: z.number(),
        price: z.string().regex(/^\d+(\.\d{2})?$/),
      })
    )
    .mutation(async (opts: any) => {
      const input = opts.input;
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db
        .update(products)
        .set({ price: input.price, updatedAt: new Date() })
        .where(eq(products.id, input.productId));

      return { success: true };
    }),

  /**
   * Toggle product active status
   */
  toggleProductActive: adminProcedure
    .input(z.object({ productId: z.number() }))
    .mutation(async (opts: any) => {
      const input = opts.input;
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const product = await db.select().from(products).where(eq(products.id, input.productId)).limit(1);

      if (!product || product.length === 0) {
        throw new Error("Product not found");
      }

      const newStatus = !product[0].isActive;

      await db
        .update(products)
        .set({ isActive: newStatus, updatedAt: new Date() })
        .where(eq(products.id, input.productId));

      return { success: true, isActive: newStatus };
    }),

  /**
   * Get sales analytics
   */
  getSalesAnalytics: adminProcedure
    .input(
      z.object({
        days: z.number().min(1).max(365).default(30),
      })
    )
    .query(async (opts: any) => {
      const input = opts.input;
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - input.days);

      const recentOrders = await db
        .select()
        .from(orders)
        .where(gte(orders.createdAt, cutoffDate));

      // Group by date
      const byDate: Record<string, { count: number; revenue: number }> = {};

      recentOrders.forEach((order) => {
        const date = new Date(order.createdAt).toISOString().split("T")[0];
        if (!byDate[date]) {
          byDate[date] = { count: 0, revenue: 0 };
        }
        byDate[date].count++;
        byDate[date].revenue += parseFloat(order.totalAmount.toString());
      });

      // Get top products
      const allItems = await db.select().from(orderItems);
      const productSales: Record<number, { name: string; quantity: number; revenue: number }> = {};

      allItems.forEach((item) => {
        if (!productSales[item.productId]) {
          productSales[item.productId] = { name: "", quantity: 0, revenue: 0 };
        }
        productSales[item.productId].quantity += item.quantity;
        productSales[item.productId].revenue += parseFloat(item.price.toString()) * item.quantity;
      });

      // Get product names
      const productIds = Object.keys(productSales).map(Number);
      if (productIds.length > 0) {
        const productsData = await db
          .select()
          .from(products)
          .where(eq(products.id, productIds[0]));

        productsData.forEach((p) => {
          if (productSales[p.id]) {
            productSales[p.id].name = p.name;
          }
        });
      }

      const topProducts = Object.entries(productSales)
        .sort((a, b) => b[1].revenue - a[1].revenue)
        .slice(0, 10)
        .map(([id, data]) => ({
          productId: Number(id),
          ...data,
        }));

      return {
        period: {
          days: input.days,
          from: cutoffDate.toISOString(),
          to: new Date().toISOString(),
        },
        totalOrders: recentOrders.length,
        totalRevenue: recentOrders.reduce((sum, o) => sum + parseFloat(o.totalAmount.toString()), 0).toFixed(2),
        averageOrderValue: (
          recentOrders.reduce((sum, o) => sum + parseFloat(o.totalAmount.toString()), 0) / recentOrders.length
        )
          .toFixed(2),
        byDate: Object.entries(byDate)
          .sort((a, b) => a[0].localeCompare(b[0]))
          .map(([date, data]) => ({
            date,
            ...data,
          })),
        topProducts,
      };
    }),
});
