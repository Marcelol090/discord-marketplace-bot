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
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    userIdIdx: index("orders_userId_idx").on(table.userId),
    discordUserIdIdx: index("orders_discordUserId_idx").on(table.discordUserId),
    statusIdx: index("orders_status_idx").on(table.status),
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
    externalId: varchar("externalId", { length: 255 }).notNull().unique(),
    provider: mysqlEnum("provider", ["stripe", "mercadopago"]).notNull(),
    status: mysqlEnum("status", ["pending", "completed", "failed", "refunded"])
      .default("pending")
      .notNull(),
    amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
    metadata: json("metadata"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    orderIdIdx: index("paymentTransactions_orderId_idx").on(table.orderId),
    externalIdIdx: index("paymentTransactions_externalId_idx").on(
      table.externalId
    ),
    orderFk: foreignKey({
      columns: [table.orderId],
      foreignColumns: [orders.id],
    }),
  })
);

export type PaymentTransaction = typeof paymentTransactions.$inferSelect;
export type InsertPaymentTransaction = typeof paymentTransactions.$inferInsert;

/**
 * Relations
 */
export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  cartItems: many(cartItems),
  orderItems: many(orderItems),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  products: many(products),
}));

export const usersRelations = relations(users, ({ many }) => ({
  cartItems: many(cartItems),
  orders: many(orders),
}));

export const cartItemsRelations = relations(cartItems, ({ one }) => ({
  user: one(users, {
    fields: [cartItems.userId],
    references: [users.id],
  }),
  product: one(products, {
    fields: [cartItems.productId],
    references: [products.id],
  }),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
  items: many(orderItems),
  paymentTransaction: one(paymentTransactions, {
    fields: [orders.id],
    references: [paymentTransactions.orderId],
  }),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
}));

export const paymentTransactionsRelations = relations(
  paymentTransactions,
  ({ one }) => ({
    order: one(orders, {
      fields: [paymentTransactions.orderId],
      references: [orders.id],
    }),
  })
);
