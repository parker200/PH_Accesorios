import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/app-error.js';
import { env } from '../config/env.js';

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors || null,
      ...(env.NODE_ENV === 'development' ? { stack: err.stack } : {})
    });
  }

  // Multer errors
  if (err.name === 'MulterError') {
    return res.status(400).json({
      success: false,
      message: `File upload error: ${err.message}`
    });
  }

  console.error('💥 Unhandled Exception:', err);

  return res.status(500).json({
    success: false,
    message: 'Internal server error',
    ...(env.NODE_ENV === 'development' ? { error: err.message, stack: err.stack } : {})
  });
};
