import "reflect-metadata";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { CategoryService } from "./CategoryService";
import { ICategoryRepository } from "../repositories/ICategoryRepository";
import { Category } from "../entities/Category";

describe("CategoryService", () => {
  let categoryService: CategoryService;
  let mockCategoryRepository: Record<keyof ICategoryRepository, any>;

  beforeEach(() => {
    mockCategoryRepository = {
      findById: vi.fn(),
      findAll: vi.fn(),
      findByName: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };

    categoryService = new CategoryService(mockCategoryRepository as unknown as ICategoryRepository);
  });

  describe("createCategory", () => {
    it("should successfully create a category when it does not exist", async () => {
      const categoryData = {
        name: "Electronics",
        description: "Electronic gadgets",
        emoji: "💻",
        order: 1,
      };

      mockCategoryRepository.findByName.mockResolvedValue(null);
      mockCategoryRepository.create.mockImplementation(async (cat: Category) => {
        return { ...cat, id: 1 };
      });

      const result = await categoryService.createCategory(categoryData);

      expect(mockCategoryRepository.findByName).toHaveBeenCalledWith(categoryData.name);
      expect(mockCategoryRepository.create).toHaveBeenCalled();
      expect(result.name).toBe(categoryData.name);
      expect(result.description).toBe(categoryData.description);
      expect(result.id).toBe(1);
    });

    it("should throw an error when category already exists", async () => {
      const categoryData = {
        name: "Electronics",
      };

      const existingCategory = Category.create(categoryData);
      mockCategoryRepository.findByName.mockResolvedValue(existingCategory);

      await expect(categoryService.createCategory(categoryData)).rejects.toThrow(
        "Category already exists"
      );
      expect(mockCategoryRepository.create).not.toHaveBeenCalled();
    });
  });
});
