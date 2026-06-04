import { Router } from 'express';
import colombiaData from '../utils/colombia-regions.json';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Locations
 *   description: Endpoints para consultar divisiones político-administrativas (Departamentos y Municipios) de Colombia.
 */

/**
 * @swagger
 * /locations/departments:
 *   get:
 *     summary: Obtener todos los departamentos de Colombia y sus municipios
 *     tags: [Locations]
 *     responses:
 *       200:
 *         description: Lista de departamentos y municipios obtenida con éxito
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
 *                     type: object
 *                     properties:
 *                       departamento:
 *                         type: string
 *                         example: "Antioquia"
 *                       ciudades:
 *                         type: array
 *                         items:
 *                           type: string
 *                         example: ["Medellín", "Envigado", "Rionegro"]
 */
router.get('/departments', (_req, res) => {
  return res.status(200).json({
    status: 'success',
    data: colombiaData,
  });
});

/**
 * @swagger
 * /locations/departments/{departmentName}/municipalities:
 *   get:
 *     summary: Obtener los municipios de un departamento específico
 *     tags: [Locations]
 *     parameters:
 *       - in: path
 *         name: departmentName
 *         required: true
 *         schema:
 *           type: string
 *         description: Nombre del departamento (ej. Antioquia)
 *     responses:
 *       200:
 *         description: Lista de municipios obtenida con éxito
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
 *                     type: string
 *                   example: ["Medellín", "Envigado", "Rionegro"]
 *       404:
 *         description: Departamento no encontrado
 */
router.get('/departments/:departmentName/municipalities', (req, res) => {
  const { departmentName } = req.params;
  const normalizedSearch = departmentName.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  
  const found = colombiaData.find(d => {
    const normalizedDept = d.departamento.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    return normalizedDept === normalizedSearch;
  });

  if (!found) {
    return res.status(404).json({
      status: 'error',
      message: `Department '${departmentName}' not found.`,
    });
  }

  return res.status(200).json({
    status: 'success',
    data: found.ciudades,
  });
});

export default router;
