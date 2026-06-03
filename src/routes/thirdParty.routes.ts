import { Router } from 'express';
import { ThirdPartyController } from '../controllers/thirdParty.controller';
import { authenticate, requireRoles } from '../middlewares/auth.middleware';
import { tenantIsolation } from '../middlewares/tenant.middleware';
import { checkTrialStatus } from '../middlewares/checkTrial.middleware';
import { validateSchema } from '../middlewares/validation.middleware';
import { createThirdPartySchema, updateThirdPartySchema } from '../validations/thirdParty.validation';

const router = Router();
const controller = new ThirdPartyController();

// All third party routes require authentication and tenant context
router.use(authenticate, tenantIsolation);

// Read endpoints
router.get('/', (req, res, next) => controller.getAll(req, res, next));
router.get('/:id', (req, res, next) => controller.getById(req, res, next));

// Write endpoints: restricted by checkTrialStatus (must have active subscription/trial)
router.use(checkTrialStatus);

router.post('/', validateSchema(createThirdPartySchema), (req, res, next) => controller.create(req, res, next));
router.put('/:id', validateSchema(updateThirdPartySchema), (req, res, next) => controller.update(req, res, next));

// Deletion restricted to Admin or Accountant
router.delete('/:id', requireRoles(['Admin', 'Accountant']), (req, res, next) => controller.delete(req, res, next));

export default router;
