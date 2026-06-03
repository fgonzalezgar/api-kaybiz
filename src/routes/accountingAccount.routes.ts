import { Router } from 'express';
import { AccountingAccountController } from '../controllers/accountingAccount.controller';
import { authenticate, requireRoles } from '../middlewares/auth.middleware';
import { tenantIsolation } from '../middlewares/tenant.middleware';
import { checkTrialStatus } from '../middlewares/checkTrial.middleware';
import { validateSchema } from '../middlewares/validation.middleware';
import { createAccountingAccountSchema, updateAccountingAccountSchema } from '../validations/accountingAccount.validation';

const router = Router();
const controller = new AccountingAccountController();

router.use(authenticate, tenantIsolation);

// Read endpoints
router.get('/', (req, res, next) => controller.getAll(req, res, next));
router.get('/:id', (req, res, next) => controller.getById(req, res, next));

// Write endpoints (restricted to Admin or Accountant)
router.use(checkTrialStatus, requireRoles(['Admin', 'Accountant']));

router.post('/', validateSchema(createAccountingAccountSchema), (req, res, next) => controller.create(req, res, next));
router.put('/:id', validateSchema(updateAccountingAccountSchema), (req, res, next) => controller.update(req, res, next));
router.delete('/:id', (req, res, next) => controller.delete(req, res, next));

// Colombia PUC Matrix manual seeder hook
router.post('/seed', (req, res, next) => controller.seedPuc(req, res, next));

export default router;
