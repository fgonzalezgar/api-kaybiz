import { Request, Response, NextFunction } from 'express';
import { ServiceSpecialistService } from '../services/serviceSpecialist.service';
import { BadRequestError } from '../utils/errors';

const serviceSpecialistService = new ServiceSpecialistService();

export class ServiceSpecialistController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId!;
      const list = await serviceSpecialistService.getAll(tenantId);
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

      const record = await serviceSpecialistService.getById(tenantId, id);
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
      const record = await serviceSpecialistService.create(tenantId, req.body);
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

      const record = await serviceSpecialistService.update(tenantId, id, req.body);
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

      await serviceSpecialistService.delete(tenantId, id);
      return res.status(200).json({
        status: 'success',
        message: 'Service specialist deleted successfully.',
      });
    } catch (error) {
      return next(error);
    }
  }
}
