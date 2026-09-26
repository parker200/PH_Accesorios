import { PromotionsRepository } from './promotions.repository.js';
import { NotFoundError, BadRequestError } from '../../errors/app-error.js';

export interface PromotionCalculationResult {
  originalPrice: number;
  finalPrice: number;
  discountPercentage: number;
  hasDiscount: boolean;
  activePromotion?: {
    id: string;
    name: string;
    type: string;
    discountPercentage: number;
  };
}

export interface PromotionWithExclusions {
  id: string;
  name: string;
  type: string;
  discountPercentage: number;
  productId: string | null;
  categoryId: string | null;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  exclusions?: { productId: string }[];
}

export class PromotionsService {
  private repo: PromotionsRepository;

  constructor(repo = new PromotionsRepository()) {
    this.repo = repo;
  }

  async getAllPromotions() {
    return this.repo.findAll();
  }

  async getPromotionById(id: string) {
    const promo = await this.repo.findById(id);
    if (!promo) {
      throw new NotFoundError(`Promotion with ID ${id} not found`);
    }
    return promo;
  }

  async createPromotion(data: {
    name: string;
    type: 'product' | 'category';
    discountPercentage: number;
    productId?: string | null;
    categoryId?: string | null;
    startDate: string;
    endDate: string;
    isActive?: boolean;
    excludedProductIds?: string[];
  }) {
    return this.repo.create({
      ...data,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate)
    });
  }

  async updatePromotion(
    id: string,
    data: {
      name?: string;
      discountPercentage?: number;
      startDate?: string;
      endDate?: string;
      isActive?: boolean;
      excludedProductIds?: string[];
    }
  ) {
    await this.getPromotionById(id);

    return this.repo.update(id, {
      ...data,
      startDate: data.startDate ? new Date(data.startDate) : undefined,
      endDate: data.endDate ? new Date(data.endDate) : undefined
    });
  }

  async deletePromotion(id: string) {
    await this.getPromotionById(id);
    return this.repo.delete(id);
  }

  async getActivePromotions(atDate: Date = new Date()) {
    return this.repo.findActivePromotions(atDate);
  }

  /**
   * Pure domain logic: Calculate price & applicable discount for a product
   * Priority rule:
   * 1. Product-specific promotion takes direct priority if valid
   * 2. Otherwise, Category promotion applies (unless product is in exclusion list)
   * 3. If multiple of the same type exist, the highest discount applies
   */
  calculatePrice(
    product: { id: string; categoryId: string; price: number },
    activePromotions: PromotionWithExclusions[]
  ): PromotionCalculationResult {
    const originalPrice = Number(product.price);

    // 1. Check for product-level promotions
    const productPromos = activePromotions.filter(
      (p) => p.type === 'product' && p.productId === product.id
    );

    let chosenPromo: PromotionWithExclusions | undefined;

    if (productPromos.length > 0) {
      // Pick the highest discount among product-specific promos
      chosenPromo = productPromos.reduce((prev, curr) =>
        curr.discountPercentage > prev.discountPercentage ? curr : prev
      );
    } else {
      // 2. Check for category-level promotions
      const categoryPromos = activePromotions.filter((p) => {
        if (p.type !== 'category' || p.categoryId !== product.categoryId) {
          return false;
        }
        // Check if product is excluded
        const isExcluded = p.exclusions?.some((e) => e.productId === product.id);
        return !isExcluded;
      });

      if (categoryPromos.length > 0) {
        // Pick the highest discount among category promos
        chosenPromo = categoryPromos.reduce((prev, curr) =>
          curr.discountPercentage > prev.discountPercentage ? curr : prev
        );
      }
    }

    if (!chosenPromo) {
      return {
        originalPrice,
        finalPrice: originalPrice,
        discountPercentage: 0,
        hasDiscount: false
      };
    }

    const discountPercentage = Number(chosenPromo.discountPercentage);
    const discountAmount = (originalPrice * discountPercentage) / 100;
    const finalPrice = Math.max(0, Math.round((originalPrice - discountAmount) * 100) / 100);

    return {
      originalPrice,
      finalPrice,
      discountPercentage,
      hasDiscount: true,
      activePromotion: {
        id: chosenPromo.id,
        name: chosenPromo.name,
        type: chosenPromo.type,
        discountPercentage
      }
    };
  }
}
