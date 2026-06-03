import { Router } from 'express';
import { BrandController } from '../controllers/brand.controller';
import { authenticate, requireRoles } from '../middlewares/auth.middleware';
import { tenantIsolation } from '../middlewares/tenant.middleware';
import { checkTrialStatus } from '../middlewares/checkTrial.middleware';
import { validateSchema } from '../middlewares/validation.middleware';
import { createBrandSchema, updateBrandSchema } from '../validations/brand.validation';

const router = Router();
const controller = new BrandController();

/**
 * @swagger
 * tags:
 *   name: Brands
 *   description: Endpoints para el catálogo de Marcas asociadas a los Inquilinos.
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Brand:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           example: "d3b07384-d113-4956-a5e2-41489632822a"
 *         tenantId:
 *           type: string
 *           format: uuid
 *           example: "a80c2f82-bb34-4bdc-b715-46c59b3f3608"
 *         name:
 *           type: string
 *           example: "Coca Cola"
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
 * /brands:
 *   get:
 *     summary: Listar todas las marcas del inquilino autenticado
 *     tags: [Brands]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de marcas obtenida con éxito
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
 *                     $ref: '#/components/schemas/Brand'
 *       401:
 *         description: No autorizado
 */
router.get('/', (req, res, next) => controller.getAll(req, res, next));

/**
 * @swagger
 * /brands/{id}:
 *   get:
 *     summary: Obtener una marca específica por su ID
 *     tags: [Brands]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID único de la marca
 *     responses:
 *       200:
 *         description: Marca obtenida con éxito
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 data:
 *                   $ref: '#/components/schemas/Brand'
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Marca no encontrada
 */
router.get('/:id', (req, res, next) => controller.getById(req, res, next));

// Write endpoints (restricted to Admin)
router.use(checkTrialStatus, requireRoles(['Admin']));

/**
 * @swagger
 * /brands:
 *   post:
 *     summary: Crear una nueva marca
 *     tags: [Brands]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Pepsi"
 *     responses:
 *       201:
 *         description: Marca creada con éxito
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 data:
 *                   $ref: '#/components/schemas/Brand'
 *       400:
 *         description: Datos de entrada inválidos o nombre duplicado para este inquilino
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Prohibido (solo Admin) o periodo de prueba vencido
 */
router.post('/', validateSchema(createBrandSchema), (req, res, next) => controller.create(req, res, next));

/**
 * @swagger
 * /brands/{id}:
 *   put:
 *     summary: Actualizar una marca existente
 *     tags: [Brands]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de la marca a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Pepsi Co."
 *     responses:
 *       200:
 *         description: Marca actualizada con éxito
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 data:
 *                   $ref: '#/components/schemas/Brand'
 *       400:
 *         description: Datos de entrada inválidos
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Prohibido (solo Admin) o periodo de prueba vencido
 *       404:
 *         description: Marca no encontrada
 */
router.put('/:id', validateSchema(updateBrandSchema), (req, res, next) => controller.update(req, res, next));

/**
 * @swagger
 * /brands/{id}:
 *   delete:
 *     summary: Eliminar una marca existente
 *     tags: [Brands]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de la marca a eliminar
 *     responses:
 *       200:
 *         description: Marca eliminada con éxito
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
 *                   example: "Brand successfully deleted."
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Prohibido (solo Admin) o periodo de prueba vencido
 *       404:
 *         description: Marca no encontrada
 */
router.delete('/:id', (req, res, next) => controller.delete(req, res, next));

export default router;
