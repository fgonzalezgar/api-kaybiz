import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { validateSchema } from '../middlewares/validation.middleware';
import { registerSchema, loginSchema } from '../validations/auth.validation';

const router = Router();
const controller = new AuthController();

router.post('/register', validateSchema(registerSchema), (req, res, next) => controller.register(req, res, next));
router.post('/login', validateSchema(loginSchema), (req, res, next) => controller.login(req, res, next));

export default router;
