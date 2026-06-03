import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { validateSchema } from '../middlewares/validation.middleware';
import { registerSchema, loginSchema } from '../validations/auth.validation';

const router = Router();
const controller = new AuthController();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Endpoints para el registro e inicio de sesión de inquilinos y usuarios de la API.
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Registrar un nuevo Inquilino y su Administrador principal
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tenant
 *               - admin
 *             properties:
 *               tenant:
 *                 type: object
 *                 required:
 *                   - businessName
 *                   - nit
 *                   - dv
 *                   - fiscalRegimen
 *                   - city
 *                   - address
 *                   - phone
 *                 properties:
 *                   businessName:
 *                     type: string
 *                     example: "Mi Negocio SAS"
 *                   nit:
 *                     type: string
 *                     example: "901234567"
 *                   dv:
 *                     type: string
 *                     maxLength: 2
 *                     example: "5"
 *                   fiscalRegimen:
 *                     type: string
 *                     example: "Común"
 *                   city:
 *                     type: string
 *                     example: "Bogotá"
 *                   address:
 *                     type: string
 *                     example: "Calle 100 # 15-20"
 *                   phone:
 *                     type: string
 *                     example: "+573001234567"
 *                   businessType:
 *                     type: string
 *                     enum: [generic, restaurant, drugstore, supermarket, salon, hardware_store]
 *                     default: generic
 *                     example: "generic"
 *               admin:
 *                 type: object
 *                 required:
 *                   - name
 *                   - email
 *                   - password
 *                 properties:
 *                   name:
 *                     type: string
 *                     example: "Carlos Pérez"
 *                   email:
 *                     type: string
 *                     format: email
 *                     example: "admin@minegocio.com"
 *                   password:
 *                     type: string
 *                     format: password
 *                     minLength: 6
 *                     example: "ClaveSegura123"
 *     responses:
 *       201:
 *         description: Registro exitoso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 message:
 *                   type: string
 *                   example: "Tenant and admin successfully registered."
 *                 data:
 *                   type: object
 *                   properties:
 *                     tenant:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           format: uuid
 *                         businessName:
 *                           type: string
 *                     admin:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           format: uuid
 *                         name:
 *                           type: string
 *                         email:
 *                           type: string
 *       400:
 *         description: Datos de entrada inválidos
 *       409:
 *         description: El email del administrador o el NIT del inquilino ya existe
 */
router.post('/register', validateSchema(registerSchema), (req, res, next) => controller.register(req, res, next));

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Iniciar sesión y obtener un token JWT
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "admin@minegocio.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "ClaveSegura123"
 *     responses:
 *       200:
 *         description: Inicio de sesión exitoso. Retorna el token JWT.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 message:
 *                   type: string
 *                   example: "Authentication successful."
 *                 data:
 *                   type: object
 *                   properties:
 *                     token:
 *                       type: string
 *                       example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           format: uuid
 *                         name:
 *                           type: string
 *                         email:
 *                           type: string
 *                         role:
 *                           type: string
 *                           example: "Admin"
 *                         tenantId:
 *                           type: string
 *                           format: uuid
 *       400:
 *         description: Datos de entrada inválidos
 *       401:
 *         description: Credenciales incorrectas
 */
router.post('/login', validateSchema(loginSchema), (req, res, next) => controller.login(req, res, next));

export default router;
