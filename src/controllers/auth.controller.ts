import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';

const authService = new AuthService();

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { tenant, admin } = req.body;
      const result = await authService.register(tenant, admin);
      
      return res.status(201).json({
        status: 'success',
        message: 'Tenant registered successfully. 14-day trial activated.',
        data: result,
      });
    } catch (error) {
      return next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const result = await authService.login({ email, password });

      return res.status(200).json({
        status: 'success',
        message: 'Logged in successfully.',
        data: result,
      });
    } catch (error) {
      return next(error);
    }
  }
}
