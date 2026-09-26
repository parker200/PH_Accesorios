import { CategoriesRepository } from './categories.repository.js';
import { ConflictError, NotFoundError } from '../../errors/app-error.js';

export class CategoriesService {
  private repo: CategoriesRepository;

  constructor(repo = new CategoriesRepository()) {
    this.repo = repo;
  }

  private slugify(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  }

  async getAllCategories(includeInactive = false) {
    return this.repo.findAll(includeInactive);
  }

  async getCategoryById(id: string) {
    const category = await this.repo.findById(id);
    if (!category) {
      throw new NotFoundError(`Category with ID ${id} not found`);
    }
    return category;
  }

  async createCategory(data: { name: string; description?: string; isActive?: boolean }) {
    const existing = await this.repo.findByName(data.name);
    if (existing) {
      throw new ConflictError(`Category with name "${data.name}" already exists`);
    }

    const slug = this.slugify(data.name);
    return this.repo.create({
      ...data,
      slug
    });
  }

  async updateCategory(id: string, data: { name?: string; description?: string; isActive?: boolean }) {
    await this.getCategoryById(id);

    let slug: string | undefined;
    if (data.name) {
      const existing = await this.repo.findByName(data.name);
      if (existing && existing.id !== id) {
        throw new ConflictError(`Category with name "${data.name}" already exists`);
      }
      slug = this.slugify(data.name);
    }

    return this.repo.update(id, {
      ...data,
      ...(slug ? { slug } : {})
    });
  }

  async deleteCategory(id: string) {
    const category = await this.getCategoryById(id);
    if (category._count.products > 0) {
      throw new ConflictError('Cannot delete category with associated products. Reassign or delete products first.');
    }
    return this.repo.delete(id);
  }
}
