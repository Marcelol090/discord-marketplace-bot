import { eq } from "drizzle-orm";
import { Category } from "../../domain/entities/Category";
import { ICategoryRepository } from "../../domain/repositories/ICategoryRepository";
import { categories as categoriesTable } from "../../../drizzle/schema";
import { getDb } from "../../db";

export class CategoryRepository implements ICategoryRepository {
  async findById(id: number): Promise<Category | null> {
    const db = await getDb();
    if (!db) return null;

    const result = await db
      .select()
      .from(categoriesTable)
      .where(eq(categoriesTable.id, id))
      .limit(1);

    return result.length > 0 ? this.mapToEntity(result[0]) : null;
  }

  async findAll(): Promise<Category[]> {
    const db = await getDb();
    if (!db) return [];

    const results = await db.select().from(categoriesTable);
    return results.map((r) => this.mapToEntity(r));
  }

  async findByName(name: string): Promise<Category | null> {
    const db = await getDb();
    if (!db) return null;

    const result = await db
      .select()
      .from(categoriesTable)
      .where(eq(categoriesTable.name, name))
      .limit(1);

    return result.length > 0 ? this.mapToEntity(result[0]) : null;
  }

  async create(category: Category): Promise<Category> {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    await db.insert(categoriesTable).values({
      name: category.name,
      description: category.description,
      emoji: category.emoji,
      order: category.order,
    });

    // Fetch the created category
    const created = await db
      .select()
      .from(categoriesTable)
      .where(eq(categoriesTable.name, category.name))
      .limit(1);

    if (created.length > 0) {
      category.id = created[0].id;
    }

    return category;
  }

  async update(category: Category): Promise<Category> {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    await db
      .update(categoriesTable)
      .set({
        name: category.name,
        description: category.description,
        emoji: category.emoji,
        order: category.order,
        updatedAt: new Date(),
      })
      .where(eq(categoriesTable.id, category.id));

    return category;
  }

  async delete(id: number): Promise<void> {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    await db.delete(categoriesTable).where(eq(categoriesTable.id, id));
  }

  private mapToEntity(row: any): Category {
    return new Category(
      row.id,
      row.name,
      row.description,
      row.emoji,
      row.order,
      row.createdAt,
      row.updatedAt
    );
  }
}
