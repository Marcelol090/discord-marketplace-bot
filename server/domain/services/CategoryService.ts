import { injectable, inject } from "tsyringe";
import { Category } from "../entities/Category";
import { ICategoryRepository } from "../repositories/ICategoryRepository";

@injectable()
export class CategoryService {
  constructor(
    @inject("ICategoryRepository")
    private categoryRepository: ICategoryRepository
  ) {}

  async getAllCategories(): Promise<Category[]> {
    return this.categoryRepository.findAll();
  }

  async getCategoryById(id: number): Promise<Category | null> {
    return this.categoryRepository.findById(id);
  }

  async getCategoryByName(name: string): Promise<Category | null> {
    return this.categoryRepository.findByName(name);
  }

  async createCategory(data: {
    name: string;
    description?: string;
    emoji?: string;
    order?: number;
  }): Promise<Category> {
    // Check if category already exists
    const existing = await this.categoryRepository.findByName(data.name);
    if (existing) {
      throw new Error("Category already exists");
    }

    const category = Category.create(data);
    return this.categoryRepository.create(category);
  }

  async updateCategory(
    id: number,
    data: Partial<{
      name: string;
      description: string;
      emoji: string;
      order: number;
    }>
  ): Promise<Category> {
    const category = await this.categoryRepository.findById(id);
    if (!category) {
      throw new Error("Category not found");
    }

    // Check if new name is already taken
    if (data.name && data.name !== category.name) {
      const existing = await this.categoryRepository.findByName(data.name);
      if (existing) {
        throw new Error("Category name already exists");
      }
    }

    Object.assign(category, data);
    return this.categoryRepository.update(category);
  }

  async deleteCategory(id: number): Promise<void> {
    return this.categoryRepository.delete(id);
  }
}
