import { Request, Response, NextFunction } from 'express';
import { CategoriesService } from './categories.service.js';

export class CategoriesController {
  private service: CategoriesService;

  constructor(service = new CategoriesService()) {
    this.service = service;
  }

  getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const includeInactive = req.query.all === 'true' && !!req.user;
      const categories = await this.service.getAllCategories(includeInactive);
      res.json({
        success: true,
        data: categories
      });
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const category = await this.service.getCategoryById(req.params.id as string);
      res.json({
        success: true,
        data: category
      });
    } catch (error) {
      next(error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const category = await this.service.createCategory(req.body);
      res.status(201).json({
        success: true,
        message: 'Category created successfully',
        data: category
      });
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const category = await this.service.updateCategory(req.params.id as string, req.body);
      res.json({
        success: true,
        message: 'Category updated successfully',
        data: category
      });
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.service.deleteCategory(req.params.id as string);
      res.json({
        success: true,
        message: 'Category deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  };
}
