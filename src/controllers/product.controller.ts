import { Request, Response, NextFunction } from 'express';
import { ProductService } from '../services/product.service';
import { BadRequestError } from '../utils/errors';

const productService = new ProductService();

export class ProductController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId!;
      const list = await productService.getAll(tenantId);
      return res.status(200).json({
        status: 'success',
        results: list.length,
        data: list,
      });
    } catch (error) {
      return next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId!;
      const { id } = req.params;
      if (!id) throw new BadRequestError('ID parameter is required.');

      const record = await productService.getById(tenantId, id);
      return res.status(200).json({
        status: 'success',
        data: record,
      });
    } catch (error) {
      return next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId!;
      const record = await productService.create(tenantId, req.body);
      return res.status(201).json({
        status: 'success',
        data: record,
      });
    } catch (error) {
      return next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId!;
      const { id } = req.params;
      if (!id) throw new BadRequestError('ID parameter is required.');

      const record = await productService.update(tenantId, id, req.body);
      return res.status(200).json({
        status: 'success',
        data: record,
      });
    } catch (error) {
      return next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId!;
      const { id } = req.params;
      if (!id) throw new BadRequestError('ID parameter is required.');

      await productService.delete(tenantId, id);
      return res.status(200).json({
        status: 'success',
        message: 'Product or service deleted successfully.',
      });
    } catch (error) {
      return next(error);
    }
  }
}
