import { Router } from 'express';
import { ServiceSpecialistController } from '../controllers/serviceSpecialist.controller';
import { authenticate, requireRoles } from '../middlewares/auth.middleware';
import { tenantIsolation } from '../middlewares/tenant.middleware';
import { checkTrialStatus } from '../middlewares/checkTrial.middleware';
import { validateSchema } from '../middlewares/validation.middleware';
import { createServiceSpecialistSchema, updateServiceSpecialistSchema } from '../validations/serviceSpecialist.validation';

const router = Router();
const controller = new ServiceSpecialistController();

/**
 * @swagger
 * tags:
 *   name: ServiceSpecialists
 *   description: Endpoints para la gestión de Especialistas de Servicios y sus comisiones.
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     ServiceSpecialist:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           example: "e2c38d2a-43cf-4171-aa34-1422ee2f9798"
 *         tenantId:
 *           type: string
 *           format: uuid
 *           example: "a80c2f82-bb34-4bdc-b715-46c59b3f3608"
 *         userId:
 *           type: string
 *           format: uuid
 *           example: "d3b07384-d113-4956-a5e2-41489632822a"
 *         commissionPercentage:
 *           type: number
 *           example: 12.50
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2026-06-03T18:00:00.000Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2026-06-03T18:00:00.000Z"
 */

router.use(authenticate, tenantIsolation);

/**
 * @swagger
 * /service-specialists:
 *   get:
 *     summary: Listar todos los especialistas de servicios del inquilino autenticado
 *     tags: [ServiceSpecialists]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de especialistas obtenida con éxito
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
 *                     $ref: '#/components/schemas/ServiceSpecialist'
 *       401:
 *         description: No autorizado
 */
router.get('/', (req, res, next) => controller.getAll(req, res, next));

/**
 * @swagger
 * /service-specialists/{id}:
 *   get:
 *     summary: Obtener un especialista específico por su ID
 *     tags: [ServiceSpecialists]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID único del especialista
 *     responses:
 *       200:
 *         description: Especialista obtenido con éxito
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 data:
 *                   $ref: '#/components/schemas/ServiceSpecialist'
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Especialista no encontrado
 */
router.get('/:id', (req, res, next) => controller.getById(req, res, next));

// Write endpoints: restricted to Admin/Accountant and gated by trial status
router.use(checkTrialStatus, requireRoles(['Admin', 'Accountant']));

/**
 * @swagger
 * /service-specialists:
 *   post:
 *     summary: Crear un nuevo especialista de servicio
 *     tags: [ServiceSpecialists]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - commissionPercentage
 *             properties:
 *               userId:
 *                 type: string
 *                 format: uuid
 *                 example: "d3b07384-d113-4956-a5e2-41489632822a"
 *               commissionPercentage:
 *                 type: number
 *                 example: 12.50
 *     responses:
 *       201:
 *         description: Especialista creado con éxito
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 data:
 *                   $ref: '#/components/schemas/ServiceSpecialist'
 *       400:
 *         description: Datos de entrada inválidos o especialista duplicado para este usuario
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Prohibido (solo Admin o Contador) o periodo de prueba vencido
 */
router.post('/', validateSchema(createServiceSpecialistSchema), (req, res, next) => controller.create(req, res, next));

/**
 * @swagger
 * /service-specialists/{id}:
 *   put:
 *     summary: Actualizar un especialista existente
 *     tags: [ServiceSpecialists]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID del especialista a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 format: uuid
 *               commissionPercentage:
 *                 type: number
 *     responses:
 *       200:
 *         description: Especialista actualizado con éxito
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 data:
 *                   $ref: '#/components/schemas/ServiceSpecialist'
 *       400:
 *         description: Datos de entrada inválidos
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Prohibido o periodo de prueba vencido
 *       404:
 *         description: Especialista no encontrado
 */
router.put('/:id', validateSchema(updateServiceSpecialistSchema), (req, res, next) => controller.update(req, res, next));

/**
 * @swagger
 * /service-specialists/{id}:
 *   delete:
 *     summary: Eliminar un especialista de servicio
 *     tags: [ServiceSpecialists]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID del especialista a eliminar
 *     responses:
 *       200:
 *         description: Especialista eliminado con éxito
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
 *                   example: "Service specialist successfully deleted."
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Prohibido o periodo de prueba vencido
 *       404:
 *         description: Especialista no encontrado
 */
router.delete('/:id', (req, res, next) => controller.delete(req, res, next));

export default router;
