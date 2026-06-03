import { Router } from 'express';
import { TenantController } from '../controllers/tenant.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { tenantIsolation } from '../middlewares/tenant.middleware';

const router = Router();
const controller = new TenantController();

/**
 * @swagger
 * tags:
 *   name: Tenants
 *   description: Endpoints para la gestión y configuración de Inquilinos (Tenants).
 */

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

export default router;
