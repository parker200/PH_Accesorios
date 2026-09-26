import { prisma } from '../../config/db.js';

export class CategoriesRepository {
  async findAll(includeInactive = false) {
    return prisma.category.findMany({
      where: includeInactive ? {} : { isActive: true },
      include: {
        _count: {
          select: { products: true }
        }
      },
      orderBy: { name: 'asc' }
    });
  }

  async findById(id: string) {
    return prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { products: true }
        }
      }
    });
  }

  async findByName(name: string) {
    return prisma.category.findUnique({
      where: { name }
    });
  }

  async findBySlug(slug: string) {
    return prisma.category.findUnique({
      where: { slug }
    });
  }

  async create(data: { name: string; slug: string; description?: string; isActive?: boolean }) {
    return prisma.category.create({
      data
    });
  }

  async update(id: string, data: { name?: string; slug?: string; description?: string; isActive?: boolean }) {
    return prisma.category.update({
      where: { id },
      data
    });
  }

  async delete(id: string) {
    return prisma.category.delete({
      where: { id }
    });
  }
}
