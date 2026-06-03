import { Request, Response, NextFunction } from 'express';
import { BrandService } from '../services/brand.service';
import { BadRequestError } from '../utils/errors';

const brandService = new BrandService();

export class BrandController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId!;
      const list = await brandService.getAll(tenantId);
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

      const record = await brandService.getById(tenantId, id);
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
      const record = await brandService.create(tenantId, req.body);
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

      const record = await brandService.update(tenantId, id, req.body);
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

      await brandService.delete(tenantId, id);
      return res.status(200).json({
        status: 'success',
        message: 'Brand deleted successfully.',
      });
    } catch (error) {
      return next(error);
    }
  }
}
