import { Request, Response, NextFunction } from 'express';
import { TenantService } from '../services/tenant.service';

const tenantService = new TenantService();

export class TenantController {
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
