import swaggerJSDoc from 'swagger-jsdoc';

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Kaybiz REST API',
      version: '1.0.0',
      description: 'API del sistema Kaybiz para la gestión total de negocios. Proporciona endpoints para autenticación, multi-inquilino (multi-tenant), marcas, categorías, productos, cuentas contables (PUC), mesas de restaurante y especialistas de servicios.',
      contact: {
        name: 'Soporte Cinndev',
        email: 'soporte@cinndev.com',
        url: 'https://cinndev.com',
      },
    },
    servers: [
      {
        url: '/api/v1',
        description: 'Servidor API v1',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Introduce tu token JWT Bearer en el formato: Bearer <JWT>',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  // Escanea tanto archivos TS en desarrollo como JS compilados en producción
  apis: [
    './src/routes/*.ts',
    './dist/routes/*.js',
  ],
};

export const swaggerSpec = swaggerJSDoc(options);
