import { Router } from 'express';
import { BrandController } from '../controllers/brand.controller';
import { authenticate, requireRoles } from '../middlewares/auth.middleware';
import { tenantIsolation } from '../middlewares/tenant.middleware';
import { checkTrialStatus } from '../middlewares/checkTrial.middleware';
import { validateSchema } from '../middlewares/validation.middleware';
import { createBrandSchema, updateBrandSchema } from '../validations/brand.validation';

const router = Router();
const controller = new BrandController();

router.use(authenticate, tenantIsolation);

// Read endpoints
router.get('/', (req, res, next) => controller.getAll(req, res, next));
router.get('/:id', (req, res, next) => controller.getById(req, res, next));

// Write endpoints (restricted to Admin)
router.use(checkTrialStatus, requireRoles(['Admin']));

router.post('/', validateSchema(createBrandSchema), (req, res, next) => controller.create(req, res, next));
router.put('/:id', validateSchema(updateBrandSchema), (req, res, next) => controller.update(req, res, next));
router.delete('/:id', (req, res, next) => controller.delete(req, res, next));

export default router;
