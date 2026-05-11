import { LRUCache } from "lru-cache";
import { getDb } from "../../db";
import { users } from "../../../drizzle/schema";
import { eq } from "drizzle-orm";

/**
 * Resolves Discord snowflake IDs to internal DB user IDs.
 * Uses LRU cache to minimize DB lookups during interaction bursts.
 * Creates user records on-the-fly if not found (upsert pattern).
 */
export class DiscordUserResolver {
  private cache: LRUCache<string, number>;

  constructor(maxCacheSize: number = 500) {
    this.cache = new LRUCache<string, number>({
      max: maxCacheSize,
      ttl: 1000 * 60 * 15, // 15 min TTL
    });
  }

  /**
   * Resolve a Discord user snowflake to a DB user ID.
   * If the user doesn't exist in DB, creates them.
   *
   * @param discordId - Discord snowflake string (e.g. "123456789")
   * @param username  - Discord username for record creation
   * @returns Internal DB user ID (number)
   */
  async resolve(discordId: string, username: string): Promise<number> {
    // Check cache first
    const cached = this.cache.get(discordId);
    if (cached !== undefined) {
      return cached;
    }

    const db = await getDb();
    if (!db) {
      throw new Error("Database not available");
    }

    // Try to find existing user by discordId
    const existing = await db
      .select()
      .from(users)
      .where(eq(users.discordId, discordId))
      .limit(1);

    if (existing.length > 0) {
      const userId = existing[0].id;
      this.cache.set(discordId, userId);
      return userId;
    }

    // User not found — create via upsert
    const openId = `discord_${discordId}`;
    await db
      .insert(users)
      .values({
        openId,
        discordId,
        name: username,
        loginMethod: "discord",
        role: "user",
        lastSignedIn: new Date(),
      })
      .onDuplicateKeyUpdate({
        set: { lastSignedIn: new Date() },
      });

    // Re-fetch to get the auto-generated ID
    const created = await db
      .select()
      .from(users)
      .where(eq(users.discordId, discordId))
      .limit(1);

    if (created.length === 0) {
      throw new Error(`Failed to create user for Discord ID: ${discordId}`);
    }

    const userId = created[0].id;
    this.cache.set(discordId, userId);
    return userId;
  }

  /**
   * Invalidate a cached user entry (e.g. after role change).
   */
  invalidate(discordId: string): void {
    this.cache.delete(discordId);
  }

  /**
   * Clear the entire cache.
   */
  clearCache(): void {
    this.cache.clear();
  }
}