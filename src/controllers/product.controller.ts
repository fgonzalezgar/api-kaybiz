import { Request, Response, NextFunction } from 'express';
import { ProductService } from '../services/product.service';
import { BadRequestError } from '../utils/errors';

const productService = new ProductService();

export class ProductController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId!;
      const { include_inactive, page, limit } = req.query;

      const result = await productService.getAll(tenantId, {
        include_inactive: include_inactive as any,
        page: page as any,
        limit: limit as any,
      });

      return res.status(200).json({
        status: 'success',
        results: result.rows.length,
        total: result.count,
        page: result.page,
        limit: result.limit,
        data: result.rows,
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

  async toggleStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId!;
      const { id } = req.params;
      if (!id) throw new BadRequestError('ID parameter is required.');

      const record = await productService.toggleStatus(tenantId, id);
      return res.status(200).json({
        status: 'success',
        message: `Product active status toggled successfully. Active: ${record.isActive}`,
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
