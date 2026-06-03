import { Router } from 'express';
import { ThirdPartyController } from '../controllers/thirdParty.controller';
import { authenticate, requireRoles } from '../middlewares/auth.middleware';
import { tenantIsolation } from '../middlewares/tenant.middleware';
import { checkTrialStatus } from '../middlewares/checkTrial.middleware';
import { validateSchema } from '../middlewares/validation.middleware';
import { createThirdPartySchema, updateThirdPartySchema } from '../validations/thirdParty.validation';

const router = Router();
const controller = new ThirdPartyController();

/**
 * @swagger
 * tags:
 *   name: ThirdParties
 *   description: Endpoints para la gestión de Terceros (Clientes y Proveedores) de los Inquilinos.
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     ThirdParty:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           example: "c0738d2a-43cf-4171-aa34-1422ee2f9798"
 *         tenantId:
 *           type: string
 *           format: uuid
 *           example: "a80c2f82-bb34-4bdc-b715-46c59b3f3608"
 *         isClient:
 *           type: boolean
 *           example: true
 *         isProvider:
 *           type: boolean
 *           example: false
 *         documentType:
 *           type: string
 *           enum: [NIT, CC, CE, RUT]
 *           example: "CC"
 *         documentNumber:
 *           type: string
 *           example: "1014996985"
 *         verificationDigit:
 *           type: string
 *           nullable: true
 *           maxLength: 2
 *           example: null
 *         companyName:
 *           type: string
 *           nullable: true
 *           example: null
 *         firstName:
 *           type: string
 *           nullable: true
 *           example: "Fernando"
 *         lastName:
 *           type: string
 *           nullable: true
 *           example: "González"
 *         email:
 *           type: string
 *           format: email
 *           example: "fernando@gmail.com"
 *         phone:
 *           type: string
 *           example: "+573112345678"
 *         address:
 *           type: string
 *           example: "Carrera 7 # 72-10"
 *         city:
 *           type: string
 *           example: "Bogotá"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2026-06-03T18:00:00.000Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2026-06-03T18:00:00.000Z"
 */

// All third party routes require authentication and tenant context
router.use(authenticate, tenantIsolation);

/**
 * @swagger
 * /third-parties:
 *   get:
 *     summary: Listar todos los terceros (clientes y proveedores) del inquilino autenticado
 *     tags: [ThirdParties]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de terceros obtenida con éxito
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ThirdParty'
 *       401:
 *         description: No autorizado
 */
router.get('/', (req, res, next) => controller.getAll(req, res, next));

/**
 * @swagger
 * /third-parties/{id}:
 *   get:
 *     summary: Obtener un tercero específico por su ID
 *     tags: [ThirdParties]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID único del tercero
 *     responses:
 *       200:
 *         description: Tercero obtenido con éxito
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 data:
 *                   $ref: '#/components/schemas/ThirdParty'
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Tercero no encontrado
 */
router.get('/:id', (req, res, next) => controller.getById(req, res, next));

// Write endpoints: restricted by checkTrialStatus (must have active subscription/trial)
router.use(checkTrialStatus);

/**
 * @swagger
 * /third-parties:
 *   post:
 *     summary: Crear un nuevo tercero
 *     tags: [ThirdParties]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - documentType
 *               - documentNumber
 *               - email
 *               - phone
 *               - address
 *               - city
 *             properties:
 *               isClient:
 *                 type: boolean
 *                 default: false
 *                 example: true
 *               isProvider:
 *                 type: boolean
 *                 default: false
 *                 example: false
 *               documentType:
 *                 type: string
 *                 enum: [NIT, CC, CE, RUT]
 *                 example: "CC"
 *               documentNumber:
 *                 type: string
 *                 example: "1014996985"
 *               verificationDigit:
 *                 type: string
 *                 maxLength: 2
 *                 example: null
 *               companyName:
 *                 type: string
 *                 example: null
 *               firstName:
 *                 type: string
 *                 example: "Fernando"
 *               lastName:
 *                 type: string
 *                 example: "González"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "fernando@gmail.com"
 *               phone:
 *                 type: string
 *                 example: "+573112345678"
 *               address:
 *                 type: string
 *                 example: "Carrera 7 # 72-10"
 *               city:
 *                 type: string
 *                 example: "Bogotá"
 *     responses:
 *       201:
 *         description: Tercero creado con éxito
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 data:
 *                   $ref: '#/components/schemas/ThirdParty'
 *       400:
 *         description: Datos de entrada inválidos o NIT/Documento duplicado para este inquilino
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Periodo de prueba vencido
 */
router.post('/', validateSchema(createThirdPartySchema), (req, res, next) => controller.create(req, res, next));

/**
 * @swagger
 * /third-parties/{id}:
 *   put:
 *     summary: Actualizar un tercero existente
 *     tags: [ThirdParties]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID del tercero a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               isClient:
 *                 type: boolean
 *               isProvider:
 *                 type: boolean
 *               documentType:
 *                 type: string
 *                 enum: [NIT, CC, CE, RUT]
 *               documentNumber:
 *                 type: string
 *               verificationDigit:
 *                 type: string
 *               companyName:
 *                 type: string
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               address:
 *                 type: string
 *               city:
 *                 type: string
 *     responses:
 *       200:
 *         description: Tercero actualizado con éxito
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 data:
 *                   $ref: '#/components/schemas/ThirdParty'
 *       400:
 *         description: Datos de entrada inválidos
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Periodo de prueba vencido
 *       404:
 *         description: Tercero no encontrado
 */
router.put('/:id', validateSchema(updateThirdPartySchema), (req, res, next) => controller.update(req, res, next));

/**
 * @swagger
 * /third-parties/{id}:
 *   delete:
 *     summary: Eliminar un tercero existente
 *     tags: [ThirdParties]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID del tercero a eliminar
 *     responses:
 *       200:
 *         description: Tercero eliminado con éxito
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
 *                   example: "Third party successfully deleted."
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Prohibido (requiere rol Admin o Contador) o periodo de prueba vencido
 *       404:
 *         description: Tercero no encontrado
 */
router.delete('/:id', requireRoles(['Admin', 'Accountant']), (req, res, next) => controller.delete(req, res, next));

export default router;
