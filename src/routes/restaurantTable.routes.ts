import { Router } from 'express';
import { RestaurantTableController } from '../controllers/restaurantTable.controller';
import { authenticate, requireRoles } from '../middlewares/auth.middleware';
import { tenantIsolation } from '../middlewares/tenant.middleware';
import { checkTrialStatus } from '../middlewares/checkTrial.middleware';
import { validateSchema } from '../middlewares/validation.middleware';
import { createRestaurantTableSchema, updateRestaurantTableSchema } from '../validations/restaurantTable.validation';

const router = Router();
const controller = new RestaurantTableController();

/**
 * @swagger
 * tags:
 *   name: RestaurantTables
 *   description: Endpoints para la gestión de Mesas de Restaurante asociadas a las sucursales.
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     RestaurantTable:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           example: "b103e33c-35cd-4b71-aa34-1188ee2f9798"
 *         tenantId:
 *           type: string
 *           format: uuid
 *           example: "a80c2f82-bb34-4bdc-b715-46c59b3f3608"
 *         branchId:
 *           type: string
 *           format: uuid
 *           example: "550e8400-e29b-41d4-a716-446655440000"
 *         tableCode:
 *           type: string
 *           example: "MESA-05"
 *         status:
 *           type: string
 *           enum: [available, occupied, reserved]
 *           example: "available"
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
 * /restaurant-tables:
 *   get:
 *     summary: Listar todas las mesas de restaurante del inquilino autenticado
 *     tags: [RestaurantTables]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de mesas obtenida con éxito
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
 *                     $ref: '#/components/schemas/RestaurantTable'
 *       401:
 *         description: No autorizado
 */
router.get('/', (req, res, next) => controller.getAll(req, res, next));

/**
 * @swagger
 * /restaurant-tables/{id}:
 *   get:
 *     summary: Obtener una mesa específica por su ID
 *     tags: [RestaurantTables]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID único de la mesa
 *     responses:
 *       200:
 *         description: Mesa obtenida con éxito
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 data:
 *                   $ref: '#/components/schemas/RestaurantTable'
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Mesa no encontrada
 */
router.get('/:id', (req, res, next) => controller.getById(req, res, next));

// Write endpoints: restricted to Admin and gated by trial status
router.use(checkTrialStatus, requireRoles(['Admin']));

/**
 * @swagger
 * /restaurant-tables:
 *   post:
 *     summary: Crear una nueva mesa de restaurante
 *     tags: [RestaurantTables]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - branchId
 *               - tableCode
 *             properties:
 *               branchId:
 *                 type: string
 *                 format: uuid
 *                 example: "550e8400-e29b-41d4-a716-446655440000"
 *               tableCode:
 *                 type: string
 *                 example: "MESA-05"
 *               status:
 *                 type: string
 *                 enum: [available, occupied, reserved]
 *                 default: available
 *                 example: "available"
 *     responses:
 *       201:
 *         description: Mesa creada con éxito
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 data:
 *                   $ref: '#/components/schemas/RestaurantTable'
 *       400:
 *         description: Datos de entrada inválidos o código de mesa duplicado en la sucursal
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Prohibido (solo Admin) o periodo de prueba vencido
 */
router.post('/', validateSchema(createRestaurantTableSchema), (req, res, next) => controller.create(req, res, next));

/**
 * @swagger
 * /restaurant-tables/{id}:
 *   put:
 *     summary: Actualizar una mesa existente
 *     tags: [RestaurantTables]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de la mesa a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               branchId:
 *                 type: string
 *                 format: uuid
 *               tableCode:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [available, occupied, reserved]
 *     responses:
 *       200:
 *         description: Mesa actualizada con éxito
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 data:
 *                   $ref: '#/components/schemas/RestaurantTable'
 *       400:
 *         description: Datos de entrada inválidos
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Prohibido o periodo de prueba vencido
 *       404:
 *         description: Mesa no encontrada
 */
router.put('/:id', validateSchema(updateRestaurantTableSchema), (req, res, next) => controller.update(req, res, next));

/**
 * @swagger
 * /restaurant-tables/{id}:
 *   delete:
 *     summary: Eliminar una mesa de restaurante
 *     tags: [RestaurantTables]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de la mesa a eliminar
 *     responses:
 *       200:
 *         description: Mesa eliminada con éxito
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
 *                   example: "Restaurant table successfully deleted."
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Prohibido o periodo de prueba vencido
 *       404:
 *         description: Mesa no encontrada
 */
router.delete('/:id', (req, res, next) => controller.delete(req, res, next));

export default router;
