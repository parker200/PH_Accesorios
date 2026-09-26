import { prisma } from '../../config/db.js';

export class ProductsRepository {
  async findAll(options: {
    categoryId?: string;
    search?: string;
    isActive?: boolean;
    skip?: number;
    take?: number;
  }) {
    const where: any = {};

    if (options.isActive !== undefined) {
      where.isActive = options.isActive;
    }

    if (options.categoryId) {
      where.categoryId = options.categoryId;
    }

    if (options.search) {
      where.OR = [
        { name: { contains: options.search } },
        { description: { contains: options.search } }
      ];
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: {
            select: { id: true, name: true, slug: true }
          },
          media: {
            orderBy: [{ isCover: 'desc' }, { displayOrder: 'asc' }]
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: options.skip,
        take: options.take
      }),
      prisma.product.count({ where })
    ]);

    return { products, total };
  }

  async findById(id: string) {
    return prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        media: {
          orderBy: [{ isCover: 'desc' }, { displayOrder: 'asc' }]
        }
      }
    });
  }

  async findBySlug(slug: string) {
    return prisma.product.findUnique({
      where: { slug },
      include: {
        category: true,
        media: {
          orderBy: [{ isCover: 'desc' }, { displayOrder: 'asc' }]
        }
      }
    });
  }

  async create(data: {
    name: string;
    slug: string;
    categoryId: string;
    description?: string;
    price: number;
    isActive?: boolean;
  }) {
    return prisma.product.create({
      data,
      include: {
        category: true,
        media: true
      }
    });
  }

  async update(
    id: string,
    data: {
      name?: string;
      slug?: string;
      categoryId?: string;
      description?: string;
      price?: number;
      isActive?: boolean;
    }
  ) {
    return prisma.product.update({
      where: { id },
      data,
      include: {
        category: true,
        media: true
      }
    });
  }

  async delete(id: string) {
    return prisma.product.delete({
      where: { id }
    });
  }

  // Media
  async addMedia(data: {
    productId: string;
    type: string;
    url: string;
    storagePath: string;
    displayOrder?: number;
    isCover?: boolean;
  }) {
    return prisma.productMedia.create({
      data
    });
  }

  async getMediaById(id: string) {
    return prisma.productMedia.findUnique({
      where: { id }
    });
  }

  async deleteMedia(id: string) {
    return prisma.productMedia.delete({
      where: { id }
    });
  }

  async setCoverMedia(productId: string, mediaId: string) {
    return prisma.$transaction([
      prisma.productMedia.updateMany({
        where: { productId },
        data: { isCover: false }
      }),
      prisma.productMedia.update({
        where: { id: mediaId },
        data: { isCover: true }
      })
    ]);
  }
}
