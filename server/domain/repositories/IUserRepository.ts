import { User } from "../entities/User";
import { InsertUser } from "../../../drizzle/schema";

export interface IUserRepository {
  findById(id: number): Promise<User | null>;
  findByOpenId(openId: string): Promise<User | null>;
  upsert(user: InsertUser): Promise<void>;
}
