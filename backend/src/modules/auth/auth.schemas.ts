import { z } from 'zod';

export const loginSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

export const updateProfileSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters').optional(),
  email: z.string().email('Invalid email address').optional()
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(6, 'Current password must be provided'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters')
});
