import { Router } from 'express';
import { CategoryController } from '../controllers/category.controller';
import { authenticate, requireRoles } from '../middlewares/auth.middleware';
import { tenantIsolation } from '../middlewares/tenant.middleware';
import { checkTrialStatus } from '../middlewares/checkTrial.middleware';
import { validateSchema } from '../middlewares/validation.middleware';
import { createCategorySchema, updateCategorySchema } from '../validations/category.validation';

const router = Router();
const controller = new CategoryController();

/**
 * @swagger
 * tags:
 *   name: Categories
 *   description: Endpoints para el catálogo de Categorías de productos.
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Category:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           example: "f81745cd-456d-4950-b0ff-90a6ea2f9798"
 *         tenantId:
 *           type: string
 *           format: uuid
 *           example: "a80c2f82-bb34-4bdc-b715-46c59b3f3608"
 *         name:
 *           type: string
 *           example: "Bebidas"
 *         slug:
 *           type: string
 *           example: "bebidas"
 *         parentId:
 *           type: string
 *           format: uuid
 *           nullable: true
 *           example: null
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
 * /categories:
 *   get:
 *     summary: Listar todas las categorías del inquilino autenticado
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de categorías obtenida con éxito
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
 *                     $ref: '#/components/schemas/Category'
 *       401:
 *         description: No autorizado
 */
router.get('/', (req, res, next) => controller.getAll(req, res, next));

/**
 * @swagger
 * /categories/{id}:
 *   get:
 *     summary: Obtener una categoría específica por su ID
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID único de la categoría
 *     responses:
 *       200:
 *         description: Categoría obtenida con éxito
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 data:
 *                   $ref: '#/components/schemas/Category'
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Categoría no encontrada
 */
router.get('/:id', (req, res, next) => controller.getById(req, res, next));

// Write endpoints gated by trial verification and restricted to Admin
router.use(checkTrialStatus, requireRoles(['Admin']));

/**
 * @swagger
 * /categories:
 *   post:
 *     summary: Crear una nueva categoría de producto
 *     tags: [Categories]
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
 *               - slug
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Gaseosas"
 *               slug:
 *                 type: string
 *                 example: "gaseosas"
 *               parentId:
 *                 type: string
 *                 format: uuid
 *                 example: "f81745cd-456d-4950-b0ff-90a6ea2f9798"
 *     responses:
 *       201:
 *         description: Categoría creada con éxito
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 data:
 *                   $ref: '#/components/schemas/Category'
 *       400:
 *         description: Datos de entrada inválidos o slug duplicado para este inquilino
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Prohibido (solo Admin) o periodo de prueba vencido
 */
router.post('/', validateSchema(createCategorySchema), (req, res, next) => controller.create(req, res, next));

/**
 * @swagger
 * /categories/{id}:
 *   put:
 *     summary: Actualizar una categoría existente
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de la categoría a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Gaseosas Importadas"
 *               slug:
 *                 type: string
 *                 example: "gaseosas-importadas"
 *               parentId:
 *                 type: string
 *                 format: uuid
 *                 nullable: true
 *                 example: null
 *     responses:
 *       200:
 *         description: Categoría actualizada con éxito
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 data:
 *                   $ref: '#/components/schemas/Category'
 *       400:
 *         description: Datos de entrada inválidos
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Prohibido (solo Admin) o periodo de prueba vencido
 *       404:
 *         description: Categoría no encontrada
 */
router.put('/:id', validateSchema(updateCategorySchema), (req, res, next) => controller.update(req, res, next));

/**
 * @swagger
 * /categories/{id}:
 *   delete:
 *     summary: Eliminar una categoría existente
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de la categoría a eliminar
 *     responses:
 *       200:
 *         description: Categoría eliminada con éxito
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
 *                   example: "Category successfully deleted."
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Prohibido (solo Admin) o periodo de prueba vencido
 *       404:
 *         description: Categoría no encontrada
 */
router.delete('/:id', (req, res, next) => controller.delete(req, res, next));

export default router;
