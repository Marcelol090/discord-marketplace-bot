import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  decimal,
  boolean,
  json,
  index,
  foreignKey,
} from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  discordId: varchar("discordId", { length: 64 }).unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin", "seller"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Categories for organizing products
 */
export const categories = mysqlTable("categories", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull().unique(),
  description: text("description"),
  emoji: varchar("emoji", { length: 10 }),
  order: int("order").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Category = typeof categories.$inferSelect;
export type InsertCategory = typeof categories.$inferInsert;

/**
 * Products in the marketplace
 */
export const products = mysqlTable(
  "products",
  {
    id: int("id").autoincrement().primaryKey(),
    categoryId: int("categoryId").notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    price: decimal("price", { precision: 10, scale: 2 }).notNull(),
    stock: int("stock").default(0).notNull(),
    imageUrl: text("imageUrl"),
    isActive: boolean("isActive").default(true).notNull(),
    // Digital asset support
    assetKey: varchar("assetKey", { length: 255 }), // S3 storage key for .otbm files
    isDigital: boolean("isDigital").default(false).notNull(), // Whether this is a digital product
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    categoryIdIdx: index("products_categoryId_idx").on(table.categoryId),
    categoryFk: foreignKey({
      columns: [table.categoryId],
      foreignColumns: [categories.id],
    }),
  })
);

export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;

/**
 * Shopping cart items (temporary storage before checkout)
 */
export const cartItems = mysqlTable(
  "cartItems",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    productId: int("productId").notNull(),
    quantity: int("quantity").default(1).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    userIdIdx: index("cartItems_userId_idx").on(table.userId),
    productIdIdx: index("cartItems_productId_idx").on(table.productId),
    userFk: foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
    }),
    productFk: foreignKey({
      columns: [table.productId],
      foreignColumns: [products.id],
    }),
  })
);

export type CartItem = typeof cartItems.$inferSelect;
export type InsertCartItem = typeof cartItems.$inferInsert;

/**
 * Orders placed by users
 */
export const orders = mysqlTable(
  "orders",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    discordUserId: varchar("discordUserId", { length: 64 }).notNull(),
    status: mysqlEnum("status", [
      "pending",
      "paid",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
    ])
      .default("pending")
      .notNull(),
    totalAmount: decimal("totalAmount", { precision: 10, scale: 2 }).notNull(),
    paymentMethod: mysqlEnum("paymentMethod", ["pix", "credit_card"]).notNull(),
    paymentId: varchar("paymentId", { length: 255 }),
    trackingNumber: varchar("trackingNumber", { length: 255 }),
    shippingAddress: json("shippingAddress"),
    notes: text("notes"),
    // Digital delivery tracking
    deliveryStatus: mysqlEnum("deliveryStatus", ["pending", "sent", "failed"]).default("pending").notNull(),
    deliveryAttempts: int("deliveryAttempts").default(0).notNull(),
    lastDeliveryAttempt: timestamp("lastDeliveryAttempt"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    userIdIdx: index("orders_userId_idx").on(table.userId),
    discordUserIdIdx: index("orders_discordUserId_idx").on(table.discordUserId),
    statusIdx: index("orders_status_idx").on(table.status),
    deliveryStatusIdx: index("orders_deliveryStatus_idx").on(table.deliveryStatus),
    userFk: foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
    }),
  })
);

export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;

/**
 * Individual items in an order
 */
export const orderItems = mysqlTable(
  "orderItems",
  {
    id: int("id").autoincrement().primaryKey(),
    orderId: int("orderId").notNull(),
    productId: int("productId").notNull(),
    quantity: int("quantity").notNull(),
    price: decimal("price", { precision: 10, scale: 2 }).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    orderIdIdx: index("orderItems_orderId_idx").on(table.orderId),
    productIdIdx: index("orderItems_productId_idx").on(table.productId),
    orderFk: foreignKey({
      columns: [table.orderId],
      foreignColumns: [orders.id],
    }),
    productFk: foreignKey({
      columns: [table.productId],
      foreignColumns: [products.id],
    }),
  })
);

export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = typeof orderItems.$inferInsert;

/**
 * Bot configuration per server
 */
export const botConfigs = mysqlTable(
  "botConfigs",
  {
    id: int("id").autoincrement().primaryKey(),
    guildId: varchar("guildId", { length: 64 }).notNull().unique(),
    shopChannelId: varchar("shopChannelId", { length: 64 }),
    logsChannelId: varchar("logsChannelId", { length: 64 }),
    adminRoleId: varchar("adminRoleId", { length: 64 }),
    sellerRoleId: varchar("sellerRoleId", { length: 64 }),
    pixKey: text("pixKey"),
    stripePublishableKey: text("stripePublishableKey"),
    stripeSecretKey: text("stripeSecretKey"),
    // Channel IDs for Boreas server
    showcaseChannelId: varchar("showcaseChannelId", { length: 64 }),
    announcementChannelId: varchar("announcementChannelId", { length: 64 }),
    promotionChannelId: varchar("promotionChannelId", { length: 64 }),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    guildIdIdx: index("botConfigs_guildId_idx").on(table.guildId),
  })
);

export type BotConfig = typeof botConfigs.$inferSelect;
export type InsertBotConfig = typeof botConfigs.$inferInsert;

/**
 * Payment transactions log
 */
export const paymentTransactions = mysqlTable(
  "paymentTransactions",
  {
    id: int("id").autoincrement().primaryKey(),
    orderId: int("orderId").notNull(),
    provider: mysqlEnum("provider", ["stripe", "pix"]).notNull(),
    externalId: varchar("externalId", { length: 255 }).notNull(),
    status: mysqlEnum("status", ["pending", "succeeded", "failed", "cancelled"]).notNull(),
    amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
    metadata: json("metadata"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    orderIdIdx: index("paymentTransactions_orderId_idx").on(table.orderId),
    externalIdIdx: index("paymentTransactions_externalId_idx").on(table.externalId),
    orderFk: foreignKey({
      columns: [table.orderId],
      foreignColumns: [orders.id],
    }),
  })
);

export type PaymentTransaction = typeof paymentTransactions.$inferSelect;
export type InsertPaymentTransaction = typeof paymentTransactions.$inferInsert;

/**
 * Click analytics for products
 */
export const clickAnalytics = mysqlTable(
  "clickAnalytics",
  {
    id: int("id").autoincrement().primaryKey(),
    productId: int("productId").notNull(),
    userId: varchar("userId", { length: 64 }),
    action: varchar("action", { length: 64 }).notNull(), // "view", "add_to_cart", "checkout"
    timestamp: timestamp("timestamp").defaultNow().notNull(),
  },
  (table) => ({
    productIdIdx: index("clickAnalytics_productId_idx").on(table.productId),
    userIdIdx: index("clickAnalytics_userId_idx").on(table.userId),
    productFk: foreignKey({
      columns: [table.productId],
      foreignColumns: [products.id],
    }),
  })
);

export type ClickAnalytic = typeof clickAnalytics.$inferSelect;
export type InsertClickAnalytic = typeof clickAnalytics.$inferInsert;

/**
 * A/B testing variants for embeds
 */
export const embedVariants = mysqlTable(
  "embedVariants",
  {
    id: int("id").autoincrement().primaryKey(),
    testId: varchar("testId", { length: 255 }).notNull(),
    variantName: varchar("variantName", { length: 255 }).notNull(),
    embedData: json("embedData").notNull(),
    clicks: int("clicks").default(0).notNull(),
    conversions: int("conversions").default(0).notNull(),
    status: mysqlEnum("status", ["active", "inactive"]).default("active").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    testIdIdx: index("embedVariants_testId_idx").on(table.testId),
  })
);

export type EmbedVariant = typeof embedVariants.$inferSelect;
export type InsertEmbedVariant = typeof embedVariants.$inferInsert;
