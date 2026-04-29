/**
 * User Entity - Represents a core user backing auth flow
 */
export class User {
  constructor(
    public id: number,
    public openId: string,
    public discordId: string | null,
    public name: string | null,
    public email: string | null,
    public loginMethod: string | null,
    public role: "user" | "admin" | "seller",
    public createdAt: Date,
    public updatedAt: Date,
    public lastSignedIn: Date
  ) {}

  static create(data: {
    openId: string;
    discordId?: string | null;
    name?: string | null;
    email?: string | null;
    loginMethod?: string | null;
    role?: "user" | "admin" | "seller";
    lastSignedIn?: Date;
  }): User {
    return new User(
      0,
      data.openId,
      data.discordId || null,
      data.name || null,
      data.email || null,
      data.loginMethod || null,
      data.role || "user",
      new Date(),
      new Date(),
      data.lastSignedIn || new Date()
    );
  }

  isAdmin(): boolean {
    return this.role === "admin";
  }

  isSeller(): boolean {
    return this.role === "seller" || this.role === "admin";
  }

  updateLastSignedIn(date: Date = new Date()): void {
    this.lastSignedIn = date;
  }
}
