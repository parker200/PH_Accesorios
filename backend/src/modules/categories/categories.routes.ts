import { Router } from 'express';
import { CategoriesController } from './categories.controller.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { createCategorySchema, updateCategorySchema, categoryParamSchema } from './categories.schemas.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { requirePermission } from '../../middlewares/rbac.middleware.js';
import { PERMISSIONS } from '../../constants/index.js';

const router = Router();
const controller = new CategoriesController();

// Public routes
router.get('/', controller.getAll);
router.get('/:id', validate({ params: categoryParamSchema }), controller.getById);

// Protected routes (Admin / Employee with permissions)
router.post(
  '/',
  authenticate,
  requirePermission(PERMISSIONS.CATEGORIES_MANAGE),
  validate({ body: createCategorySchema }),
  controller.create
);

router.put(
  '/:id',
  authenticate,
  requirePermission(PERMISSIONS.CATEGORIES_MANAGE),
  validate({ params: categoryParamSchema, body: updateCategorySchema }),
  controller.update
);

router.delete(
  '/:id',
  authenticate,
  requirePermission(PERMISSIONS.CATEGORIES_MANAGE),
  validate({ params: categoryParamSchema }),
  controller.delete
);

export const categoriesRoutes = router;
