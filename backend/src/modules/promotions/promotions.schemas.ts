import { z } from 'zod';

export const createPromotionSchema = z.object({
  name: z.string().min(2, 'Promotion name must be at least 2 characters').max(100),
  type: z.enum(['product', 'category'], {
    errorMap: () => ({ message: 'Type must be "product" or "category"' })
  }),
  discountPercentage: z
    .number()
    .min(1, 'Discount must be at least 1%')
    .max(100, 'Discount cannot exceed 100%'),
  productId: z.string().uuid().optional().nullable(),
  categoryId: z.string().uuid().optional().nullable(),
  startDate: z.string().datetime({ message: 'Start date must be an ISO 8601 string' }),
  endDate: z.string().datetime({ message: 'End date must be an ISO 8601 string' }),
  isActive: z.boolean().optional().default(true),
  excludedProductIds: z.array(z.string().uuid()).optional().default([])
}).refine(
  (data) => {
    if (data.type === 'product' && !data.productId) {
      return false;
    }
    if (data.type === 'category' && !data.categoryId) {
      return false;
    }
    return true;
  },
  {
    message: 'Product ID is required for product promotions, and Category ID is required for category promotions'
  }
).refine(
  (data) => new Date(data.endDate) > new Date(data.startDate),
  {
    message: 'End date must be after start date',
    path: ['endDate']
  }
);

export const updatePromotionSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  discountPercentage: z.number().min(1).max(100).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  isActive: z.boolean().optional(),
  excludedProductIds: z.array(z.string().uuid()).optional()
}).refine(
  (data) => {
    if (data.startDate && data.endDate) {
      return new Date(data.endDate) > new Date(data.startDate);
    }
    return true;
  },
  {
    message: 'End date must be after start date',
    path: ['endDate']
  }
);

export const promotionParamSchema = z.object({
  id: z.string().uuid('Invalid Promotion ID')
});
