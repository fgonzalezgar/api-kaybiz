import { Request, Response, NextFunction } from 'express';
import { ForbiddenError, NotFoundError } from '../utils/errors';
import { Tenant } from '../database/models/tenant.model';

export const checkTrialStatus = async (req: Request, _res: Response, next: NextFunction) => {
  // Only intercept mutating requests (write operations)
  const writeMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];
  if (!writeMethods.includes(req.method)) {
    return next();
  }

  const tenantId = req.tenantId;
  if (!tenantId) {
    return next(new ForbiddenError('Tenant context is required.'));
  }

  try {
    const tenant = await Tenant.findByPk(tenantId);
    if (!tenant) {
      return next(new NotFoundError('Tenant profile not found.'));
    }

    if (tenant.accountStatus === 'suspended') {
      return next(new ForbiddenError('Account is suspended. Please contact support.'));
    }

    if (tenant.accountStatus === 'trial') {
      if (!tenant.isTrialActive) {
        return next(new ForbiddenError('Trial period is inactive.'));
      }

      const now = new Date();
      if (now > tenant.trialEndDate) {
        // Option to update tenant status in the DB if expired, but direct verification is safer
        return next(new ForbiddenError('Your 14-day trial period has expired. Please upgrade to a paid plan.'));
      }
    }

    return next();
  } catch (error) {
    return next(error);
  }
};
