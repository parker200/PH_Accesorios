import { Router } from 'express';
import { PromotionsController } from './promotions.controller.js';
import { validate } from '../../middlewares/validate.middleware.js';
import {
  createPromotionSchema,
  updatePromotionSchema,
  promotionParamSchema
} from './promotions.schemas.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { requirePermission } from '../../middlewares/rbac.middleware.js';
import { PERMISSIONS } from '../../constants/index.js';

const router = Router();
const controller = new PromotionsController();

// Promotions require authentication and permission for management
router.use(authenticate, requirePermission(PERMISSIONS.PROMOTIONS_MANAGE));

router.get('/', controller.getAll);
router.get('/:id', validate({ params: promotionParamSchema }), controller.getById);
router.post('/', validate({ body: createPromotionSchema }), controller.create);
router.put(
  '/:id',
  validate({ params: promotionParamSchema, body: updatePromotionSchema }),
  controller.update
);
router.delete('/:id', validate({ params: promotionParamSchema }), controller.delete);

export const promotionsRoutes = router;
