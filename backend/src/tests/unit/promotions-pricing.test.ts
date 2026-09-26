import { describe, it, expect } from 'vitest';
import { PromotionsService, PromotionWithExclusions } from '../../modules/promotions/promotions.service.js';

describe('PromotionsService - Pricing Calculation Engine', () => {
  const service = new PromotionsService();

  const sampleProductA = {
    id: 'prod-001',
    categoryId: 'cat-auriculares',
    price: 100.0
  };

  const sampleProductB = {
    id: 'prod-002',
    categoryId: 'cat-auriculares',
    price: 50.0
  };

  it('debe devolver precio original sin descuento si no hay promociones activas', () => {
    const activePromotions: PromotionWithExclusions[] = [];
    const result = service.calculatePrice(sampleProductA, activePromotions);

    expect(result.hasDiscount).toBe(false);
    expect(result.originalPrice).toBe(100.0);
    expect(result.finalPrice).toBe(100.0);
    expect(result.discountPercentage).toBe(0);
    expect(result.activePromotion).toBeUndefined();
  });

  it('debe aplicar descuento por categoría correctamente', () => {
    const activePromotions: PromotionWithExclusions[] = [
      {
        id: 'promo-cat-1',
        name: '15% en Auriculares',
        type: 'category',
        discountPercentage: 15,
        productId: null,
        categoryId: 'cat-auriculares',
        startDate: new Date('2026-01-01'),
        endDate: new Date('2026-12-31'),
        isActive: true,
        exclusions: []
      }
    ];

    const result = service.calculatePrice(sampleProductA, activePromotions);

    expect(result.hasDiscount).toBe(true);
    expect(result.originalPrice).toBe(100.0);
    expect(result.finalPrice).toBe(85.0);
    expect(result.discountPercentage).toBe(15);
    expect(result.activePromotion?.name).toBe('15% en Auriculares');
  });

  it('NO debe aplicar descuento si el producto está en la lista de exclusiones de la categoría', () => {
    const activePromotions: PromotionWithExclusions[] = [
      {
        id: 'promo-cat-1',
        name: '20% en Auriculares salvo prod-001',
        type: 'category',
        discountPercentage: 20,
        productId: null,
        categoryId: 'cat-auriculares',
        startDate: new Date('2026-01-01'),
        endDate: new Date('2026-12-31'),
        isActive: true,
        exclusions: [{ productId: 'prod-001' }]
      }
    ];

    // sampleProductA está excluido
    const resultA = service.calculatePrice(sampleProductA, activePromotions);
    expect(resultA.hasDiscount).toBe(false);
    expect(resultA.finalPrice).toBe(100.0);

    // sampleProductB NO está excluido
    const resultB = service.calculatePrice(sampleProductB, activePromotions);
    expect(resultB.hasDiscount).toBe(true);
    expect(resultB.finalPrice).toBe(40.0); // 50 - 20% = 40
  });

  it('debe dar precedencia a una promoción de producto sobre una de categoría', () => {
    const activePromotions: PromotionWithExclusions[] = [
      {
        id: 'promo-cat',
        name: '10% en Auriculares',
        type: 'category',
        discountPercentage: 10,
        productId: null,
        categoryId: 'cat-auriculares',
        startDate: new Date('2026-01-01'),
        endDate: new Date('2026-12-31'),
        isActive: true,
        exclusions: []
      },
      {
        id: 'promo-prod',
        name: '25% Especial en este Producto',
        type: 'product',
        discountPercentage: 25,
        productId: 'prod-001',
        categoryId: null,
        startDate: new Date('2026-01-01'),
        endDate: new Date('2026-12-31'),
        isActive: true
      }
    ];

    const result = service.calculatePrice(sampleProductA, activePromotions);

    expect(result.hasDiscount).toBe(true);
    expect(result.discountPercentage).toBe(25);
    expect(result.finalPrice).toBe(75.0);
    expect(result.activePromotion?.id).toBe('promo-prod');
  });
});
