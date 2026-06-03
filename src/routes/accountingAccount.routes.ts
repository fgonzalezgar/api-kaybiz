import { Router } from 'express';
import { AccountingAccountController } from '../controllers/accountingAccount.controller';
import { authenticate, requireRoles } from '../middlewares/auth.middleware';
import { tenantIsolation } from '../middlewares/tenant.middleware';
import { checkTrialStatus } from '../middlewares/checkTrial.middleware';
import { validateSchema } from '../middlewares/validation.middleware';
import { createAccountingAccountSchema, updateAccountingAccountSchema } from '../validations/accountingAccount.validation';

const router = Router();
const controller = new AccountingAccountController();

/**
 * @swagger
 * tags:
 *   name: AccountingAccounts
 *   description: Endpoints para la gestión del Plan Único de Cuentas (PUC) de los Inquilinos.
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     AccountingAccount:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           example: "7c5e20d1-6783-4a65-8b3d-9d414a1e948c"
 *         tenantId:
 *           type: string
 *           format: uuid
 *           example: "a80c2f82-bb34-4bdc-b715-46c59b3f3608"
 *         code:
 *           type: string
 *           example: "110505"
 *         name:
 *           type: string
 *           example: "Caja General"
 *         type:
 *           type: string
 *           enum: [Asset, Liability, Equity, Revenue, Expense]
 *           example: "Asset"
 *         level:
 *           type: integer
 *           minimum: 1
 *           maximum: 4
 *           example: 3
 *         allowsMovement:
 *           type: boolean
 *           example: true
 *         requiresCostCenter:
 *           type: boolean
 *           example: false
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
 * /accounting-accounts:
 *   get:
 *     summary: Listar todas las cuentas contables del inquilino autenticado
 *     tags: [AccountingAccounts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de cuentas contables obtenida con éxito
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
 *                     $ref: '#/components/schemas/AccountingAccount'
 *       401:
 *         description: No autorizado
 */
router.get('/', (req, res, next) => controller.getAll(req, res, next));

/**
 * @swagger
 * /accounting-accounts/{id}:
 *   get:
 *     summary: Obtener una cuenta contable específica por su ID
 *     tags: [AccountingAccounts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID único de la cuenta contable
 *     responses:
 *       200:
 *         description: Cuenta contable obtenida con éxito
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 data:
 *                   $ref: '#/components/schemas/AccountingAccount'
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Cuenta contable no encontrada
 */
router.get('/:id', (req, res, next) => controller.getById(req, res, next));

// Write endpoints (restricted to Admin or Accountant)
router.use(checkTrialStatus, requireRoles(['Admin', 'Accountant']));

/**
 * @swagger
 * /accounting-accounts:
 *   post:
 *     summary: Crear una nueva cuenta contable PUC
 *     tags: [AccountingAccounts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *               - name
 *               - type
 *               - level
 *             properties:
 *               code:
 *                 type: string
 *                 example: "110505"
 *               name:
 *                 type: string
 *                 example: "Caja General"
 *               type:
 *                 type: string
 *                 enum: [Asset, Liability, Equity, Revenue, Expense]
 *                 example: "Asset"
 *               level:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 4
 *                 example: 3
 *               allowsMovement:
 *                 type: boolean
 *                 default: true
 *                 example: true
 *               requiresCostCenter:
 *                 type: boolean
 *                 default: false
 *                 example: false
 *     responses:
 *       201:
 *         description: Cuenta contable creada con éxito
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 data:
 *                   $ref: '#/components/schemas/AccountingAccount'
 *       400:
 *         description: Datos de entrada inválidos o código duplicado para este inquilino
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Prohibido (solo Admin o Contador) o periodo de prueba vencido
 */
router.post('/', validateSchema(createAccountingAccountSchema), (req, res, next) => controller.create(req, res, next));

/**
 * @swagger
 * /accounting-accounts/{id}:
 *   put:
 *     summary: Actualizar una cuenta contable existente
 *     tags: [AccountingAccounts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de la cuenta contable a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               code:
 *                 type: string
 *               name:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [Asset, Liability, Equity, Revenue, Expense]
 *               level:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 4
 *               allowsMovement:
 *                 type: boolean
 *               requiresCostCenter:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Cuenta contable actualizada con éxito
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 data:
 *                   $ref: '#/components/schemas/AccountingAccount'
 *       400:
 *         description: Datos de entrada inválidos
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Prohibido o periodo de prueba vencido
 *       404:
 *         description: Cuenta contable no encontrada
 */
router.put('/:id', validateSchema(updateAccountingAccountSchema), (req, res, next) => controller.update(req, res, next));

/**
 * @swagger
 * /accounting-accounts/{id}:
 *   delete:
 *     summary: Eliminar una cuenta contable existente
 *     tags: [AccountingAccounts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de la cuenta contable a eliminar
 *     responses:
 *       200:
 *         description: Cuenta contable eliminada con éxito
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
 *                   example: "Accounting account successfully deleted."
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Prohibido o periodo de prueba vencido
 *       404:
 *         description: Cuenta contable no encontrada
 */
router.delete('/:id', (req, res, next) => controller.delete(req, res, next));

/**
 * @swagger
 * /accounting-accounts/seed:
 *   post:
 *     summary: Inicializar el PUC estándar de Colombia para el inquilino autenticado
 *     tags: [AccountingAccounts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: PUC inicializado y sembrado con éxito para el inquilino
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
 *                   example: "PUC successfully seeded."
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Prohibido o periodo de prueba vencido
 */
router.post('/seed', (req, res, next) => controller.seedPuc(req, res, next));

export default router;
