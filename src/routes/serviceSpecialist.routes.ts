import { Router } from 'express';
import { ServiceSpecialistController } from '../controllers/serviceSpecialist.controller';
import { authenticate, requireRoles } from '../middlewares/auth.middleware';
import { tenantIsolation } from '../middlewares/tenant.middleware';
import { checkTrialStatus } from '../middlewares/checkTrial.middleware';
import { validateSchema } from '../middlewares/validation.middleware';
import { createServiceSpecialistSchema, updateServiceSpecialistSchema } from '../validations/serviceSpecialist.validation';

const router = Router();
const controller = new ServiceSpecialistController();

router.use(authenticate, tenantIsolation);

// Read endpoints
router.get('/', (req, res, next) => controller.getAll(req, res, next));
router.get('/:id', (req, res, next) => controller.getById(req, res, next));

// Write endpoints: restricted to Admin/Accountant and gated by trial status
router.use(checkTrialStatus, requireRoles(['Admin', 'Accountant']));

router.post('/', validateSchema(createServiceSpecialistSchema), (req, res, next) => controller.create(req, res, next));
router.put('/:id', validateSchema(updateServiceSpecialistSchema), (req, res, next) => controller.update(req, res, next));
router.delete('/:id', (req, res, next) => controller.delete(req, res, next));

export default router;
