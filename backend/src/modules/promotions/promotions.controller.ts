import { Request, Response, NextFunction } from 'express';
import { PromotionsService } from './promotions.service.js';

export class PromotionsController {
  private service: PromotionsService;

  constructor(service = new PromotionsService()) {
    this.service = service;
  }

  getAll = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const promotions = await this.service.getAllPromotions();
      res.json({
        success: true,
        data: promotions
      });
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const promotion = await this.service.getPromotionById(req.params.id);
      res.json({
        success: true,
        data: promotion
      });
    } catch (error) {
      next(error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const promotion = await this.service.createPromotion(req.body);
      res.status(201).json({
        success: true,
        message: 'Promotion created successfully',
        data: promotion
      });
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const promotion = await this.service.updatePromotion(req.params.id, req.body);
      res.json({
        success: true,
        message: 'Promotion updated successfully',
        data: promotion
      });
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.service.deletePromotion(req.params.id);
      res.json({
        success: true,
        message: 'Promotion deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  };
}
