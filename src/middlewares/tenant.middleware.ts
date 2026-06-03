import { Request, Response, NextFunction } from 'express';
import { UnauthorizedError } from '../utils/errors';

export const tenantIsolation = (req: Request, _res: Response, next: NextFunction) => {
  if (!req.tenantId) {
    return next(new UnauthorizedError('Tenant context is required but was not provided.'));
  }
  return next();
};
