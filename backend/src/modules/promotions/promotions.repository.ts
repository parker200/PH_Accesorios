import { prisma } from '../../config/db.js';

export class PromotionsRepository {
  async findAll() {
    return prisma.promotion.findMany({
      include: {
        product: {
          select: { id: true, name: true, price: true }
        },
        category: {
          select: { id: true, name: true }
        },
        exclusions: {
          include: {
            product: {
              select: { id: true, name: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async findById(id: string) {
    return prisma.promotion.findUnique({
      where: { id },
      include: {
        product: true,
        category: true,
        exclusions: {
          include: {
            product: {
              select: { id: true, name: true }
            }
          }
        }
      }
    });
  }

  async findActivePromotions(atDate: Date = new Date()) {
    return prisma.promotion.findMany({
      where: {
        isActive: true,
        startDate: { lte: atDate },
        endDate: { gte: atDate }
      },
      include: {
        exclusions: {
          select: { productId: true }
        }
      }
    });
  }

  async create(data: {
    name: string;
    type: string;
    discountPercentage: number;
    productId?: string | null;
    categoryId?: string | null;
    startDate: Date;
    endDate: Date;
    isActive?: boolean;
    excludedProductIds?: string[];
  }) {
    const { excludedProductIds, ...promoData } = data;

    return prisma.promotion.create({
      data: {
        ...promoData,
        exclusions: excludedProductIds && excludedProductIds.length > 0
          ? {
              create: excludedProductIds.map((pId) => ({
                productId: pId
              }))
            }
          : undefined
      },
      include: {
        product: true,
        category: true,
        exclusions: true
      }
    });
  }

  async update(
    id: string,
    data: {
      name?: string;
      discountPercentage?: number;
      startDate?: Date;
      endDate?: Date;
      isActive?: boolean;
      excludedProductIds?: string[];
    }
  ) {
    const { excludedProductIds, ...promoData } = data;

    return prisma.$transaction(async (tx) => {
      if (excludedProductIds !== undefined) {
        // Clear old exclusions
        await tx.promotionExclusion.deleteMany({
          where: { promotionId: id }
        });

        // Add new exclusions
        if (excludedProductIds.length > 0) {
          await tx.promotionExclusion.createMany({
            data: excludedProductIds.map((pId) => ({
              promotionId: id,
              productId: pId
            }))
          });
        }
      }

      return tx.promotion.update({
        where: { id },
        data: promoData,
        include: {
          product: true,
          category: true,
          exclusions: {
            include: { product: true }
          }
        }
      });
    });
  }

  async delete(id: string) {
    return prisma.promotion.delete({
      where: { id }
    });
  }
}
