import { z } from 'zod';

export const createCategorySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50),
  description: z.string().max(255).optional(),
  isActive: z.boolean().optional().default(true)
});

export const updateCategorySchema = createCategorySchema.partial();

export const categoryParamSchema = z.object({
  id: z.string().uuid('Invalid Category ID')
});
