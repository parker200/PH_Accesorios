import { Router } from 'express';
import { ProductsController } from './products.controller.js';
import { validate } from '../../middlewares/validate.middleware.js';
import {
  createProductSchema,
  updateProductSchema,
  productQuerySchema,
  productParamSchema,
  productMediaParamSchema
} from './products.schemas.js';
import { uploadMedia } from '../../middlewares/upload.middleware.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { requirePermission } from '../../middlewares/rbac.middleware.js';
import { PERMISSIONS } from '../../constants/index.js';

const router = Router();
const controller = new ProductsController();

// Public routes
router.get('/', validate({ query: productQuerySchema }), controller.getAll);
router.get('/:id', validate({ params: productParamSchema }), controller.getById);

// Protected routes (Admin / Employee)
router.post(
  '/',
  authenticate,
  requirePermission(PERMISSIONS.PRODUCTS_MANAGE),
  validate({ body: createProductSchema }),
  controller.create
);

router.put(
  '/:id',
  authenticate,
  requirePermission(PERMISSIONS.PRODUCTS_MANAGE),
  validate({ params: productParamSchema, body: updateProductSchema }),
  controller.update
);

router.delete(
  '/:id',
  authenticate,
  requirePermission(PERMISSIONS.PRODUCTS_MANAGE),
  validate({ params: productParamSchema }),
  controller.delete
);

// Media routes
router.post(
  '/:id/media',
  authenticate,
  requirePermission(PERMISSIONS.PRODUCTS_MANAGE),
  validate({ params: productParamSchema }),
  uploadMedia.array('files', 10),
  controller.uploadMedia
);

router.delete(
  '/:productId/media/:mediaId',
  authenticate,
  requirePermission(PERMISSIONS.PRODUCTS_MANAGE),
  validate({ params: productMediaParamSchema }),
  controller.deleteMedia
);

router.patch(
  '/:productId/media/:mediaId/cover',
  authenticate,
  requirePermission(PERMISSIONS.PRODUCTS_MANAGE),
  validate({ params: productMediaParamSchema }),
  controller.setCoverMedia
);

export const productsRoutes = router;
