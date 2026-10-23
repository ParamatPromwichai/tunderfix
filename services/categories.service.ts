import * as categoriesRepo from "@/repositories/categories.repository";

export async function getActiveCategories() {
  return await categoriesRepo.getAllCategories();
}

export async function getCategory(id: string) {
  return await categoriesRepo.getCategoryById(id);
}

export async function createCategory(name: string, description?: string) {
  return await categoriesRepo.createCategory(name, description);
}
