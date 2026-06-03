import { Router } from 'express';
import { TenantController } from '../controllers/tenant.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { tenantIsolation } from '../middlewares/tenant.middleware';

const router = Router();
const controller = new TenantController();

// Protected config route
router.get('/config', authenticate, tenantIsolation, (req, res, next) => controller.getConfig(req, res, next));

export default router;
