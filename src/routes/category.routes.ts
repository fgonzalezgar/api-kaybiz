import { Router } from 'express';
import { CategoryController } from '../controllers/category.controller';
import { authenticate, requireRoles } from '../middlewares/auth.middleware';
import { tenantIsolation } from '../middlewares/tenant.middleware';
import { checkTrialStatus } from '../middlewares/checkTrial.middleware';
import { validateSchema } from '../middlewares/validation.middleware';
import { createCategorySchema, updateCategorySchema } from '../validations/category.validation';

const router = Router();
const controller = new CategoryController();

router.use(authenticate, tenantIsolation);

// Read endpoints accessible to all authenticated tenant users
router.get('/', (req, res, next) => controller.getAll(req, res, next));
router.get('/:id', (req, res, next) => controller.getById(req, res, next));

// Write endpoints gated by trial verification and restricted to Admin
router.use(checkTrialStatus, requireRoles(['Admin']));

router.post('/', validateSchema(createCategorySchema), (req, res, next) => controller.create(req, res, next));
router.put('/:id', validateSchema(updateCategorySchema), (req, res, next) => controller.update(req, res, next));
router.delete('/:id', (req, res, next) => controller.delete(req, res, next));

export default router;
