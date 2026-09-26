import { z } from 'zod';

export const createProductSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  categoryId: z.string().uuid('Invalid Category ID'),
  description: z.string().max(2000).optional(),
  price: z.coerce.number().positive('Price must be greater than 0'),
  isActive: z.coerce.boolean().optional().default(true)
});

export const updateProductSchema = createProductSchema.partial();

export const productQuerySchema = z.object({
  categoryId: z.string().uuid().optional(),
  search: z.string().optional(),
  isActive: z.enum(['true', 'false', 'all']).optional(),
  all: z.enum(['true', 'false']).optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(50)
});

export const productParamSchema = z.object({
  id: z.string().uuid('Invalid Product ID')
});

export const productMediaParamSchema = z.object({
  productId: z.string().uuid('Invalid Product ID'),
  mediaId: z.string().uuid('Invalid Media ID')
});
