import { Router } from 'express';
import { ProductController } from '../controllers/product.controller';
import { authenticate, requireRoles } from '../middlewares/auth.middleware';
import { tenantIsolation } from '../middlewares/tenant.middleware';
import { checkTrialStatus } from '../middlewares/checkTrial.middleware';
import { validateSchema } from '../middlewares/validation.middleware';
import { createProductSchema, updateProductSchema } from '../validations/product.validation';

const router = Router();
const controller = new ProductController();

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: Endpoints para el catálogo de Productos y Servicios de los Inquilinos.
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           example: "d0738d2a-43cf-4171-aa34-1422ee2f9798"
 *         tenantId:
 *           type: string
 *           format: uuid
 *           example: "a80c2f82-bb34-4bdc-b715-46c59b3f3608"
 *         categoryId:
 *           type: string
 *           format: uuid
 *           example: "f81745cd-456d-4950-b0ff-90a6ea2f9798"
 *         brandId:
 *           type: string
 *           format: uuid
 *           example: "d3b07384-d113-4956-a5e2-41489632822a"
 *         name:
 *           type: string
 *           example: "Refresco Coca-Cola 350ml"
 *         skuBarcode:
 *           type: string
 *           example: "7702004001234"
 *         type:
 *           type: string
 *           enum: [product, service]
 *           example: "product"
 *         cost:
 *           type: number
 *           example: 1500.00
 *         price:
 *           type: number
 *           example: 2500.00
 *         taxPercentage:
 *           type: integer
 *           enum: [0, 5, 19]
 *           example: 19
 *         accountingAccountRevenueId:
 *           type: string
 *           format: uuid
 *           example: "7c5e20d1-6783-4a65-8b3d-9d414a1e948c"
 *         accountingAccountExpenseId:
 *           type: string
 *           format: uuid
 *           example: "bb1d8a43-cf85-45ea-90bd-1004aef72da1"
 *         requiresExpirationControl:
 *           type: boolean
 *           example: false
 *         batchNumber:
 *           type: string
 *           nullable: true
 *           example: "B-2026-06"
 *         isRecipePrepared:
 *           type: boolean
 *           example: false
 *         isActive:
 *           type: boolean
 *           example: true
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
 * /products:
 *   get:
 *     summary: Listar todos los productos y servicios del inquilino autenticado
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: include_inactive
 *         schema:
 *           type: boolean
 *         description: Incluir productos inactivos (por defecto es false)
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número de página para paginación
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Cantidad de registros por página
 *     responses:
 *       200:
 *         description: Lista de productos obtenida con éxito
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 results:
 *                   type: integer
 *                   example: 1
 *                 total:
 *                   type: integer
 *                   example: 1
 *                 page:
 *                   type: integer
 *                   example: 1
 *                 limit:
 *                   type: integer
 *                   example: 10
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Product'
 *       401:
 *         description: No autorizado
 */
router.get('/', (req, res, next) => controller.getAll(req, res, next));

/**
 * @swagger
 * /products/{id}:
 *   get:
 *     summary: Obtener un producto o servicio específico por su ID
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID único del producto o servicio
 *     responses:
 *       200:
 *         description: Producto obtenido con éxito
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 data:
 *                   $ref: '#/components/schemas/Product'
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Producto no encontrado
 */
router.get('/:id', (req, res, next) => controller.getById(req, res, next));

// Write endpoints (restricted to Admin or Accountant)
router.use(checkTrialStatus, requireRoles(['Admin', 'Accountant']));

/**
 * @swagger
 * /products:
 *   post:
 *     summary: Crear un nuevo producto o servicio
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - categoryId
 *               - brandId
 *               - name
 *               - skuBarcode
 *               - type
 *               - cost
 *               - price
 *               - taxPercentage
 *               - accountingAccountRevenueId
 *               - accountingAccountExpenseId
 *             properties:
 *               categoryId:
 *                 type: string
 *                 format: uuid
 *                 example: "f81745cd-456d-4950-b0ff-90a6ea2f9798"
 *               brandId:
 *                 type: string
 *                 format: uuid
 *                 example: "d3b07384-d113-4956-a5e2-41489632822a"
 *               name:
 *                 type: string
 *                 example: "Refresco Coca-Cola 350ml"
 *               skuBarcode:
 *                 type: string
 *                 example: "7702004001234"
 *               type:
 *                 type: string
 *                 enum: [product, service]
 *                 example: "product"
 *               cost:
 *                 type: number
 *                 example: 1500.00
 *               price:
 *                 type: number
 *                 example: 2500.00
 *               taxPercentage:
 *                 type: integer
 *                 enum: [0, 5, 19]
 *                 example: 19
 *               accountingAccountRevenueId:
 *                 type: string
 *                 format: uuid
 *                 example: "7c5e20d1-6783-4a65-8b3d-9d414a1e948c"
 *               accountingAccountExpenseId:
 *                 type: string
 *                 format: uuid
 *                 example: "bb1d8a43-cf85-45ea-90bd-1004aef72da1"
 *               requiresExpirationControl:
 *                 type: boolean
 *                 example: false
 *               batchNumber:
 *                 type: string
 *                 example: "B-2026-06"
 *               isRecipePrepared:
 *                 type: boolean
 *                 example: false
 *               isActive:
 *                 type: boolean
 *                 default: true
 *                 example: true
 *     responses:
 *       201:
 *         description: Producto creado con éxito
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 data:
 *                   $ref: '#/components/schemas/Product'
 *       400:
 *         description: Datos de entrada inválidos o SKU duplicado para este inquilino
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Prohibido (solo Admin o Contador) o periodo de prueba vencido
 */
router.post('/', validateSchema(createProductSchema), (req, res, next) => controller.create(req, res, next));

/**
 * @swagger
 * /products/{id}:
 *   put:
 *     summary: Actualizar un producto o servicio existente
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID del producto a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               categoryId:
 *                 type: string
 *                 format: uuid
 *               brandId:
 *                 type: string
 *                 format: uuid
 *               name:
 *                 type: string
 *               skuBarcode:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [product, service]
 *               cost:
 *                 type: number
 *               price:
 *                 type: number
 *               taxPercentage:
 *                 type: integer
 *                 enum: [0, 5, 19]
 *               accountingAccountRevenueId:
 *                 type: string
 *                 format: uuid
 *               accountingAccountExpenseId:
 *                 type: string
 *                 format: uuid
 *               requiresExpirationControl:
 *                 type: boolean
 *               batchNumber:
 *                 type: string
 *               isRecipePrepared:
 *                 type: boolean
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Producto actualizado con éxito
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 data:
 *                   $ref: '#/components/schemas/Product'
 *       400:
 *         description: Datos de entrada inválidos
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Prohibido o periodo de prueba vencido
 *       404:
 *         description: Producto no encontrado
 */
router.put('/:id', validateSchema(updateProductSchema), (req, res, next) => controller.update(req, res, next));

/**
 * @swagger
 * /products/{id}/toggle-status:
 *   patch:
 *     summary: Cambiar el estado activo/inactivo de un producto o servicio
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID único del producto o servicio
 *     responses:
 *       200:
 *         description: Estado cambiado con éxito
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
 *                   example: "Product active status toggled successfully. Active: false"
 *                 data:
 *                   $ref: '#/components/schemas/Product'
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Prohibido o periodo de prueba vencido
 *       404:
 *         description: Producto no encontrado
 */
router.patch('/:id/toggle-status', (req, res, next) => controller.toggleStatus(req, res, next));

/**
 * @swagger
 * /products/{id}:
 *   delete:
 *     summary: Eliminar un producto o servicio existente
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID del producto a eliminar
 *     responses:
 *       200:
 *         description: Producto eliminado con éxito
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
 *                   example: "Product successfully deleted."
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Prohibido o periodo de prueba vencido
 *       404:
 *         description: Producto no encontrado
 */
router.delete('/:id', (req, res, next) => controller.delete(req, res, next));

export default router;
