import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { AuthController } from './auth.controller.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { loginSchema, updateProfileSchema, changePasswordSchema } from './auth.schemas.js';
import { authenticate } from '../../middlewares/auth.middleware.js';

const router = Router();
const controller = new AuthController();

// Rate limiter for login: max 10 attempts per 15 minutes
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    message: 'Demasiados intentos de inicio de sesión. Por favor intenta nuevamente en 15 minutos.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Public auth routes
router.post('/login', loginLimiter, validate({ body: loginSchema }), controller.login);

// Protected profile routes
router.get('/me', authenticate, controller.me);
router.patch('/profile', authenticate, validate({ body: updateProfileSchema }), controller.updateProfile);
router.patch('/password', authenticate, validate({ body: changePasswordSchema }), controller.changePassword);

export const authRoutes = router;
