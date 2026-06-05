import { eq } from "drizzle-orm";
import { User as UserEntity } from "../../domain/entities/User";
import { IUserRepository } from "../../domain/repositories/IUserRepository";
import { users as usersTable, InsertUser, User as DbUser } from "../../../drizzle/schema";
import { getDb } from "../../db";
import { ENV } from "../../_core/env";

export class UserRepository implements IUserRepository {
  async findById(id: number): Promise<UserEntity | null> {
    const db = await getDb();
    if (!db) return null;

    const result = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, id))
      .limit(1);

    return result.length > 0 ? this.mapToEntity(result[0]) : null;
  }

  async findByOpenId(openId: string): Promise<UserEntity | null> {
    const db = await getDb();
    if (!db) return null;

    const result = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.openId, openId))
      .limit(1);

    return result.length > 0 ? this.mapToEntity(result[0]) : null;
  }

  async upsert(user: InsertUser): Promise<void> {
    if (!user.openId) {
      throw new Error("User openId is required for upsert");
    }

    const db = await getDb();
    if (!db) {
      console.warn("[Database] Cannot upsert user: database not available");
      return;
    }

    try {
      const values: InsertUser = {
        openId: user.openId,
      };
      const updateSet: Record<string, unknown> = {};

      const textFields = ["name", "email", "loginMethod"] as const;
      type TextField = (typeof textFields)[number];

      const assignNullable = (field: TextField) => {
        const value = user[field];
        if (value === undefined) return;
        const normalized = value ?? null;
        values[field] = normalized;
        updateSet[field] = normalized;
      };

      textFields.forEach(assignNullable);

      if (user.lastSignedIn !== undefined) {
        values.lastSignedIn = user.lastSignedIn;
        updateSet.lastSignedIn = user.lastSignedIn;
      }
      if (user.role !== undefined) {
        values.role = user.role;
        updateSet.role = user.role;
      } else if (user.openId === ENV.ownerOpenId) {
        values.role = "admin";
        updateSet.role = "admin";
      }

      if (!values.lastSignedIn) {
        values.lastSignedIn = new Date();
      }

      if (Object.keys(updateSet).length === 0) {
        updateSet.lastSignedIn = new Date();
      }

      await db.insert(usersTable).values(values).onDuplicateKeyUpdate({
        set: updateSet,
      });
    } catch (error) {
      console.error("[Database] Failed to upsert user:", error);
      throw error;
    }
  }

  private mapToEntity(row: DbUser): UserEntity {
    return new UserEntity(
      row.id,
      row.openId,
      row.discordId,
      row.name,
      row.email,
      row.loginMethod,
      row.role,
      row.createdAt,
      row.updatedAt,
      row.lastSignedIn
    );
  }
}
