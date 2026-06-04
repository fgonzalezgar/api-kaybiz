import { Request, Response, NextFunction } from 'express';
import { TenantService } from '../services/tenant.service';
import { ForbiddenError } from '../utils/errors';

const tenantService = new TenantService();

export class TenantController {
  async getAll(_req: Request, res: Response, next: NextFunction) {
    try {
      // List all tenants (restricted to Admin)
      const tenants = await tenantService.getAll();
      return res.status(200).json({
        status: 'success',
        data: tenants,
      });
    } catch (error) {
      return next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      // Access control: User must be Admin or request their own tenant
      if (req.userRole !== 'Admin' && req.tenantId !== id) {
        throw new ForbiddenError('You do not have permission to view this business profile.');
      }

      const tenant = await tenantService.getById(id);
      return res.status(200).json({
        status: 'success',
        data: tenant,
      });
    } catch (error) {
      return next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const tenant = await tenantService.create(req.body);
      return res.status(201).json({
        status: 'success',
        message: 'Business profile successfully registered and 14-day trial started.',
        data: tenant,
      });
    } catch (error) {
      return next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      // Access control: Must be Admin and belong to the target tenant
      if (req.tenantId !== id) {
        throw new ForbiddenError('You can only update your own business profile.');
      }

      const tenant = await tenantService.update(id, req.body);
      return res.status(200).json({
        status: 'success',
        data: tenant,
      });
    } catch (error) {
      return next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      // Access control: Must belong to the target tenant
      if (req.tenantId !== id) {
        throw new ForbiddenError('You can only delete your own business profile.');
      }

      const result = await tenantService.delete(id);
      return res.status(200).json({
        status: 'success',
        message: 'Business profile and associated data successfully deleted.',
        data: result,
      });
    } catch (error) {
      return next(error);
    }
  }

  async getConfig(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId!;
      const config = await tenantService.getConfig(tenantId);
      
      return res.status(200).json({
        status: 'success',
        data: config,
      });
    } catch (error) {
      return next(error);
    }
  }
}
