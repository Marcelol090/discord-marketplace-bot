/**
 * Category Entity - Represents a product category
 */
export class Category {
  constructor(
    public id: number,
    public name: string,
    public description: string | null,
    public emoji: string | null,
    public order: number,
    public createdAt: Date,
    public updatedAt: Date
  ) {}

  static create(data: {
    name: string;
    description?: string | null;
    emoji?: string | null;
    order?: number;
  }): Category {
    return new Category(
      0,
      data.name,
      data.description || null,
      data.emoji || null,
      data.order || 0,
      new Date(),
      new Date()
    );
  }
}
