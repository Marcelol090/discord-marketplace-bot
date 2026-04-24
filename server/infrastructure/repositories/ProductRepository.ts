import { eq, and } from "drizzle-orm";
import { Product } from "../../domain/entities/Product";
import { IProductRepository } from "../../domain/repositories/IProductRepository";
import { products as productsTable } from "../../../drizzle/schema";
import { getDb } from "../../db";

export class ProductRepository implements IProductRepository {
  async findById(id: number): Promise<Product | null> {
    const db = await getDb();
    if (!db) return null;

    const result = await db
      .select()
      .from(productsTable)
      .where(eq(productsTable.id, id))
      .limit(1);

    return result.length > 0 ? this.mapToEntity(result[0]) : null;
  }

  async findByCategory(categoryId: number): Promise<Product[]> {
    const db = await getDb();
    if (!db) return [];

    const results = await db
      .select()
      .from(productsTable)
      .where(eq(productsTable.categoryId, categoryId));

    return results.map((r) => this.mapToEntity(r));
  }

  async findAll(): Promise<Product[]> {
    const db = await getDb();
    if (!db) return [];

    const results = await db.select().from(productsTable);
    return results.map((r) => this.mapToEntity(r));
  }

  async findActive(): Promise<Product[]> {
    const db = await getDb();
    if (!db) return [];

    const results = await db
      .select()
      .from(productsTable)
      .where(eq(productsTable.isActive, true));

    return results.map((r) => this.mapToEntity(r));
  }

  async create(product: Product): Promise<Product> {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    await db.insert(productsTable).values({
      categoryId: product.categoryId,
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      imageUrl: product.imageUrl,
      isActive: product.isActive,
    });

    // Fetch the created product to get the ID
    const created = await db
      .select()
      .from(productsTable)
      .where(eq(productsTable.name, product.name))
      .orderBy((t) => t.id)
      .limit(1);

    if (created.length > 0) {
      product.id = created[0].id;
    }

    return product;
  }

  async update(product: Product): Promise<Product> {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    await db
      .update(productsTable)
      .set({
        categoryId: product.categoryId,
        name: product.name,
        description: product.description,
        price: product.price,
        stock: product.stock,
        imageUrl: product.imageUrl,
        isActive: product.isActive,
        updatedAt: new Date(),
      })
      .where(eq(productsTable.id, product.id));

    return product;
  }

  async delete(id: number): Promise<void> {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    await db.delete(productsTable).where(eq(productsTable.id, id));
  }

  async decreaseStock(id: number, quantity: number): Promise<void> {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const product = await this.findById(id);
    if (!product) throw new Error("Product not found");

    product.decreaseStock(quantity);
    await this.update(product);
  }

  async increaseStock(id: number, quantity: number): Promise<void> {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const product = await this.findById(id);
    if (!product) throw new Error("Product not found");

    product.increaseStock(quantity);
    await this.update(product);
  }

  private mapToEntity(row: any): Product {
    return new Product(
      row.id,
      row.categoryId,
      row.name,
      row.description,
      row.price,
      row.stock,
      row.imageUrl,
      row.isActive,
      row.createdAt,
      row.updatedAt
    );
  }
}
