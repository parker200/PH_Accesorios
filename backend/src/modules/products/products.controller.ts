import { Request, Response, NextFunction } from 'express';
import { ProductsService } from './products.service.js';
import { BadRequestError } from '../../errors/app-error.js';

export class ProductsController {
  private service: ProductsService;

  constructor(service = new ProductsService()) {
    this.service = service;
  }

  getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { categoryId, search, isActive, all, page, limit } = req.query as any;
      
      let filterActive: boolean | undefined;
      if (isActive === 'all' || all === 'true') {
        filterActive = undefined; // Returns both active and inactive
      } else if (isActive === 'true') {
        filterActive = true;
      } else if (isActive === 'false') {
        filterActive = false;
      } else {
        // Default: active only for public requests
        filterActive = true;
      }

      const result = await this.service.getAllProducts({
        categoryId,
        search,
        isActive: filterActive,
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 50
      });

      res.json({
        success: true,
        data: result.products,
        pagination: result.pagination
      });
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const product = await this.service.getProductById(req.params.id as string);
      res.json({
        success: true,
        data: product
      });
    } catch (error) {
      next(error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const product = await this.service.createProduct(req.body);
      res.status(201).json({
        success: true,
        message: 'Product created successfully',
        data: product
      });
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const product = await this.service.updateProduct(req.params.id as string, req.body);
      res.json({
        success: true,
        message: 'Product updated successfully',
        data: product
      });
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.service.deleteProduct(req.params.id as string);
      res.json({
        success: true,
        message: 'Product deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  uploadMedia = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        throw new BadRequestError('At least one file must be provided');
      }

      const isCover = req.body.isCover === 'true' || req.body.isCover === true;
      const media = await this.service.uploadProductMedia(req.params.id as string, files, isCover);

      res.status(201).json({
        success: true,
        message: 'Media uploaded successfully',
        data: media
      });
    } catch (error) {
      next(error);
    }
  };

  deleteMedia = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.service.deleteMedia(req.params.productId as string, req.params.mediaId as string);
      res.json({
        success: true,
        message: 'Media deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  setCoverMedia = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.service.setCoverMedia(req.params.productId as string, req.params.mediaId as string);
      res.json({
        success: true,
        message: 'Cover media updated successfully'
      });
    } catch (error) {
      next(error);
    }
  };
}
