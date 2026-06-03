import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UnauthorizedError, ForbiddenError } from '../utils/errors';
import { UserRole } from '../database/models/user.model';

interface JwtPayload {
  userId: string;
  tenantId: string;
  userRole: UserRole;
  userBranchId: string | null;
}

export const authenticate = (req: Request, _res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new UnauthorizedError('Access token is missing or invalid. Please login again.'));
  }

  const token = authHeader.split(' ')[1];
  const jwtSecret = process.env.JWT_SECRET || 'super-secret-key-kaybiz-total-gestion-1234';

  try {
    const decoded = jwt.verify(token, jwtSecret) as JwtPayload;
    
    req.userId = decoded.userId;
    req.tenantId = decoded.tenantId;
    req.userRole = decoded.userRole;
    req.userBranchId = decoded.userBranchId ?? undefined;

    return next();
  } catch (error) {
    return next(new UnauthorizedError('Token is expired or invalid. Please login again.'));
  }
};

export const requireRoles = (allowedRoles: UserRole[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.userRole) {
      return next(new UnauthorizedError('User authentication details not found.'));
    }

    if (!allowedRoles.includes(req.userRole as UserRole)) {
      return next(new ForbiddenError('You do not have permission to access this resource.'));
    }

    return next();
  };
};
