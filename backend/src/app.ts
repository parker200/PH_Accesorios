import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { env } from './config/env.js';
import { errorHandler } from './middlewares/error.middleware.js';
import { authRoutes } from './modules/auth/auth.routes.js';
import { categoriesRoutes } from './modules/categories/categories.routes.js';
import { productsRoutes } from './modules/products/products.routes.js';
import { promotionsRoutes } from './modules/promotions/promotions.routes.js';
import { NotFoundError } from './errors/app-error.js';

export const createApp = () => {
  const app = express();

  // Security middlewares
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' }
    })
  );

  app.use(
    cors({
      origin: env.CORS_ORIGIN,
      credentials: true
    })
  );

  // Body parsers
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Static files for uploaded photos and short videos
  const uploadDir = path.resolve(env.UPLOAD_DIR);
  app.use('/uploads', express.static(uploadDir));

  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'healthy',
      app: 'Accesorios PH API',
      timestamp: new Date().toISOString()
    });
  });

  // API modules
  app.use('/api/auth', authRoutes);
  app.use('/api/categories', categoriesRoutes);
  app.use('/api/products', productsRoutes);
  app.use('/api/promotions', promotionsRoutes);

  // 404 for unknown API routes
  app.use('/api/*', () => {
    throw new NotFoundError('Endpoint no encontrado');
  });

  // In production, serve frontend build if dist folder exists
  const frontendDist = path.resolve('../frontend/dist');
  app.use(express.static(frontendDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
      return next();
    }
    res.sendFile(path.join(frontendDist, 'index.html'), (err) => {
      if (err) next();
    });
  });

  // Centralized Error Handler
  app.use(errorHandler);

  return app;
};
