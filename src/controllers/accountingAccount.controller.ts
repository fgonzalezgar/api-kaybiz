import { Request, Response, NextFunction } from 'express';
import { AccountingAccountService } from '../services/accountingAccount.service';
import { BadRequestError } from '../utils/errors';

const accountingAccountService = new AccountingAccountService();

export class AccountingAccountController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId!;
      const list = await accountingAccountService.getAll(tenantId);
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

      const record = await accountingAccountService.getById(tenantId, id);
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
      const record = await accountingAccountService.create(tenantId, req.body);
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

      const record = await accountingAccountService.update(tenantId, id, req.body);
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

      await accountingAccountService.delete(tenantId, id);
      return res.status(200).json({
        status: 'success',
        message: 'Accounting account deleted successfully.',
      });
    } catch (error) {
      return next(error);
    }
  }

  async seedPuc(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId!;
      const seeded = await accountingAccountService.seedPucMatrix(tenantId);
      return res.status(200).json({
        status: 'success',
        message: 'Colombia PUC matrix seeded successfully for this tenant.',
        results: seeded.length,
      });
    } catch (error) {
      return next(error);
    }
  }
}
