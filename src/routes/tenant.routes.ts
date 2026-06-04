import { Router } from 'express';
import { TenantController } from '../controllers/tenant.controller';
import { authenticate, requireRoles } from '../middlewares/auth.middleware';
import { tenantIsolation } from '../middlewares/tenant.middleware';
import { validateSchema } from '../middlewares/validation.middleware';
import { createTenantSchema, updateTenantSchema } from '../validations/tenant.validation';

const router = Router();
const controller = new TenantController();

/**
 * @swagger
 * tags:
 *   name: Tenants
 *   description: Endpoints para la gestión y configuración de Inquilinos (Tenants/Empresas) y sus pruebas de 14 días.
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Tenant:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           example: "a80c2f82-bb34-4bdc-b715-46c59b3f3608"
 *         businessName:
 *           type: string
 *           example: "Mi Negocio SAS"
 *         nit:
 *           type: string
 *           example: "901234567"
 *         dv:
 *           type: string
 *           example: "5"
 *         fiscalRegimen:
 *           type: string
 *           example: "Simplificado"
 *         city:
 *           type: string
 *           example: "Bogotá"
 *         address:
 *           type: string
 *           example: "Calle Principal 123"
 *         phone:
 *           type: string
 *           example: "+573001234567"
 *         trialStartDate:
 *           type: string
 *           format: date-time
 *           example: "2026-06-03T18:00:00.000Z"
 *         trialEndDate:
 *           type: string
 *           format: date-time
 *           example: "2026-06-17T18:00:00.000Z"
 *         isTrialActive:
 *           type: boolean
 *           example: true
 *         accountStatus:
 *           type: string
 *           enum: [trial, active, suspended]
 *           example: "trial"
 *         businessType:
 *           type: string
 *           enum: [generic, restaurant, drugstore, supermarket, salon, hardware_store]
 *           example: "generic"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2026-06-03T18:00:00.000Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2026-06-03T18:00:00.000Z"
 */

// Route to get current tenant features config (requires normal tenant login context)
/**
 * @swagger
 * /tenants/config:
 *   get:
 *     summary: Obtener la configuración y características habilitadas para el Inquilino autenticado
 *     tags: [Tenants]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Configuración obtenida con éxito
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 data:
 *                   type: object
 *                   properties:
 *                     business_type:
 *                       type: string
 *                       example: "restaurant"
 *                     features:
 *                       type: object
 *                       properties:
 *                         expiration_control:
 *                           type: boolean
 *                           example: false
 *                         batch_tracking:
 *                           type: boolean
 *                           example: false
 *                         recipe_management:
 *                           type: boolean
 *                           example: true
 *                         tables_layout:
 *                           type: boolean
 *                           example: true
 *                         specialist_commission:
 *                           type: boolean
 *                           example: false
 *       401:
 *         description: No autorizado (Token JWT faltante o inválido)
 *       404:
 *         description: Inquilino no encontrado
 */
router.get('/config', authenticate, tenantIsolation, (req, res, next) => controller.getConfig(req, res, next));

// Global Tenant CRUD endpoints (restricted to Admins)
router.use(authenticate);

/**
 * @swagger
 * /tenants:
 *   get:
 *     summary: Listar todas las empresas registradas en el sistema (Solo Administradores)
 *     tags: [Tenants]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de empresas obtenida con éxito
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
 *                     $ref: '#/components/schemas/Tenant'
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Prohibido (solo Admin)
 * 
 *   post:
 *     summary: Registrar una nueva empresa directamente con prueba de 14 días (Solo Administradores)
 *     tags: [Tenants]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - businessName
 *               - nit
 *               - dv
 *               - phone
 *             properties:
 *               businessName:
 *                 type: string
 *                 example: "Ferretería Central"
 *               nit:
 *                 type: string
 *                 example: "800123456"
 *               dv:
 *                 type: string
 *                 maxLength: 2
 *                 example: "3"
 *               phone:
 *                 type: string
 *                 example: "+573219876543"
 *               address:
 *                 type: string
 *                 example: "Avenida 80 # 30-40"
 *               city:
 *                 type: string
 *                 example: "Medellín"
 *               fiscalRegimen:
 *                 type: string
 *                 example: "Simplificado"
 *               businessType:
 *                 type: string
 *                 enum: [generic, restaurant, drugstore, supermarket, salon, hardware_store]
 *                 example: "hardware_store"
 *     responses:
 *       201:
 *         description: Empresa creada con éxito e inicio de prueba configurado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 data:
 *                   $ref: '#/components/schemas/Tenant'
 *       400:
 *         description: Datos de entrada inválidos
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Prohibido (solo Admin)
 *       409:
 *         description: El NIT ingresado ya se encuentra registrado
 */
router.post('/', requireRoles(['Admin']), validateSchema(createTenantSchema), (req, res, next) => controller.create(req, res, next));

/**
 * @swagger
 * /tenants/{id}:
 *   get:
 *     summary: Obtener los detalles de perfil de una empresa específica por su ID
 *     tags: [Tenants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID único de la empresa/inquilino
 *     responses:
 *       200:
 *         description: Detalles de la empresa obtenidos con éxito
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 data:
 *                   $ref: '#/components/schemas/Tenant'
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Prohibido (debe pertenecer al mismo Inquilino o ser Admin)
 *       404:
 *         description: Empresa no encontrada
 * 
 *   put:
 *     summary: Actualizar la información de perfil de la empresa (Solo Administrador de la misma)
 *     tags: [Tenants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID único de la empresa a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               businessName:
 *                 type: string
 *               nit:
 *                 type: string
 *               dv:
 *                 type: string
 *               phone:
 *                 type: string
 *               address:
 *                 type: string
 *               city:
 *                 type: string
 *               fiscalRegimen:
 *                 type: string
 *               businessType:
 *                 type: string
 *                 enum: [generic, restaurant, drugstore, supermarket, salon, hardware_store]
 *     responses:
 *       200:
 *         description: Perfil de empresa actualizado con éxito
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 data:
 *                   $ref: '#/components/schemas/Tenant'
 *       400:
 *         description: Datos de entrada inválidos
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Prohibido (solo se permite actualizar su propia empresa)
 *       404:
 *         description: Empresa no encontrada
 * 
 *   delete:
 *     summary: Eliminar (soft-delete) el perfil de una empresa (Solo Administrador de la misma)
 *     tags: [Tenants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de la empresa a eliminar
 *     responses:
 *       200:
 *         description: Empresa eliminada con éxito
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
 *                   example: "Business profile and associated data successfully deleted."
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Prohibido (solo se permite eliminar su propia empresa)
 *       404:
 *         description: Empresa no encontrada
 */
router.get('/:id', (req, res, next) => controller.getById(req, res, next));
router.put('/:id', requireRoles(['Admin']), validateSchema(updateTenantSchema), (req, res, next) => controller.update(req, res, next));
router.delete('/:id', requireRoles(['Admin']), (req, res, next) => controller.delete(req, res, next));

export default router;
