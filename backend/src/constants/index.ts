export const ROLES = {
  ADMIN: 'ADMIN',
  EMPLOYEE: 'EMPLOYEE'
} as const;

export type RoleType = (typeof ROLES)[keyof typeof ROLES];

export const PERMISSIONS = {
  PRODUCTS_MANAGE: 'products:manage',
  CATEGORIES_MANAGE: 'categories:manage',
  PROMOTIONS_MANAGE: 'promotions:manage',
  SETTINGS_MANAGE: 'settings:manage'
} as const;

export const PROMOTION_TYPE = {
  PRODUCT: 'product',
  CATEGORY: 'category'
} as const;

export type PromotionType = (typeof PROMOTION_TYPE)[keyof typeof PROMOTION_TYPE];

export const MEDIA_TYPE = {
  IMAGE: 'image',
  VIDEO: 'video'
} as const;

export type MediaType = (typeof MEDIA_TYPE)[keyof typeof MEDIA_TYPE];
