import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';
import apiRouter from './routes';
import { errorHandler } from './middlewares/error.middleware';
import { NotFoundError } from './utils/errors';

const app = express();

// Security Middlewares
app.use((req, res, next) => {
  if (req.path === '/' || req.path.startsWith('/api-docs')) {
    return next();
  }
  helmet()(req, res, next);
});

app.use(cors({
  origin: '*', // Customize for production
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Request Logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan(process.env.NODE_ENV === 'development' ? 'dev' : 'combined'));
}

// Payload Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Welcome landing page with premium theme
app.get('/', (_req, res) => {
  const uptime = Math.floor(process.uptime());
  const hours = Math.floor(uptime / 3600);
  const minutes = Math.floor((uptime % 3600) / 60);
  const seconds = uptime % 60;
  const uptimeString = `${hours}h ${minutes}m ${seconds}s`;

  res.send(`
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Kaybiz REST API - Dashboard</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&family=Plus+Jakarta+Sans:wght@300;400;500;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg-gradient: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%);
      --card-bg: rgba(30, 41, 59, 0.7);
      --card-border: rgba(255, 255, 255, 0.08);
      --text-primary: #f8fafc;
      --text-secondary: #94a3b8;
      --primary-glow: #8b5cf6;
      --secondary-glow: #06b6d4;
      --accent: #10b981;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: var(--bg-gradient);
      color: var(--text-primary);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      align-items: center;
      padding: 2rem 1rem;
      overflow-x: hidden;
      position: relative;
    }

    body::before, body::after {
      content: '';
      position: absolute;
      width: 300px;
      height: 300px;
      border-radius: 50%;
      filter: blur(120px);
      z-index: 0;
      opacity: 0.15;
    }
    body::before {
      top: 10%;
      left: 15%;
      background: var(--primary-glow);
    }
    body::after {
      bottom: 15%;
      right: 15%;
      background: var(--secondary-glow);
    }

    main {
      z-index: 1;
      width: 100%;
      max-width: 680px;
      margin: auto;
    }

    .card {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 24px;
      padding: 3rem 2.5rem;
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
      text-align: center;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }

    .card:hover {
      transform: translateY(-4px);
      box-shadow: 0 25px 50px rgba(139, 92, 246, 0.1);
      border-color: rgba(139, 92, 246, 0.2);
    }

    .logo-container {
      margin-bottom: 1.5rem;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      position: relative;
    }

    .logo-badge {
      background: linear-gradient(135deg, var(--primary-glow), var(--secondary-glow));
      padding: 0.75rem 1.5rem;
      border-radius: 50px;
      font-family: 'Outfit', sans-serif;
      font-weight: 800;
      font-size: 1.8rem;
      letter-spacing: -0.5px;
      box-shadow: 0 8px 24px rgba(139, 92, 246, 0.35);
      color: #fff;
    }

    h1 {
      font-family: 'Outfit', sans-serif;
      font-weight: 800;
      font-size: 2.5rem;
      margin-bottom: 0.5rem;
      background: linear-gradient(to right, #ffffff, #e2e8f0);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      letter-spacing: -0.5px;
    }

    .slogan {
      font-size: 1.1rem;
      color: var(--text-secondary);
      font-weight: 400;
      margin-bottom: 2rem;
      position: relative;
    }

    .status-container {
      display: flex;
      justify-content: center;
      gap: 1.5rem;
      flex-wrap: wrap;
      margin-bottom: 2.5rem;
    }

    .status-item {
      background: rgba(15, 23, 42, 0.4);
      border: 1px solid rgba(255, 255, 255, 0.05);
      border-radius: 12px;
      padding: 0.75rem 1.25rem;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      min-width: 140px;
      justify-content: center;
    }

    .status-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background-color: var(--accent);
      box-shadow: 0 0 10px var(--accent);
      animation: pulse 1.8s infinite;
    }

    @keyframes pulse {
      0% {
        transform: scale(0.95);
        box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
      }
      70% {
        transform: scale(1);
        box-shadow: 0 0 0 8px rgba(16, 185, 129, 0);
      }
      100% {
        transform: scale(0.95);
        box-shadow: 0 0 0 0 rgba(16, 185, 129, 0);
      }
    }

    .status-label {
      font-size: 0.85rem;
      font-weight: 500;
      color: var(--text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .status-value {
      font-size: 0.95rem;
      font-weight: 600;
      color: var(--text-primary);
    }

    .features-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1rem;
      margin-bottom: 2.5rem;
      text-align: left;
    }

    @media (max-width: 580px) {
      .features-grid {
        grid-template-columns: 1fr;
      }
      .card {
        padding: 2.5rem 1.5rem;
      }
    }

    .feature-tag {
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid rgba(255, 255, 255, 0.04);
      border-radius: 12px;
      padding: 0.75rem 1rem;
      font-size: 0.9rem;
      color: var(--text-secondary);
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .feature-tag::before {
      content: '✦';
      color: var(--secondary-glow);
      font-weight: bold;
    }

    .btn-docs {
      background: linear-gradient(135deg, var(--primary-glow) 0%, #7c3aed 100%);
      color: #ffffff;
      font-size: 1.1rem;
      font-weight: 700;
      padding: 1.1rem 2.2rem;
      border-radius: 14px;
      text-decoration: none;
      display: inline-block;
      width: 100%;
      border: none;
      cursor: pointer;
      box-shadow: 0 10px 25px rgba(139, 92, 246, 0.4);
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
    }

    .btn-docs:hover {
      transform: translateY(-2px);
      box-shadow: 0 15px 30px rgba(139, 92, 246, 0.5);
      background: linear-gradient(135deg, #9333ea 0%, #6d28d9 100%);
    }

    .btn-docs:active {
      transform: translateY(1px);
    }

    footer {
      z-index: 1;
      width: 100%;
      text-align: center;
      padding-top: 2rem;
      border-top: 1px solid rgba(255, 255, 255, 0.05);
      max-width: 680px;
    }

    .copyright {
      font-size: 0.8rem;
      color: var(--text-secondary);
      line-height: 1.5;
      letter-spacing: 0.2px;
    }

    .owner-brand {
      color: var(--secondary-glow);
      font-weight: 600;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <main>
    <div class="card">
      <div class="logo-container">
        <div class="logo-badge">Kaybiz</div>
      </div>
      <h1>Kaybiz REST API</h1>
      <p class="slogan">Gestión total – Simple y potente.</p>
      
      <div class="status-container">
        <div class="status-item">
          <div class="status-dot"></div>
          <div>
            <div class="status-label">Estado</div>
            <div class="status-value">Online</div>
          </div>
        </div>
        <div class="status-item">
          <div>
            <div class="status-label">Versión</div>
            <div class="status-value">1.0.0</div>
          </div>
        </div>
        <div class="status-item">
          <div>
            <div class="status-label">Uptime</div>
            <div class="status-value">${uptimeString}</div>
          </div>
        </div>
      </div>

      <div class="features-grid">
        <div class="feature-tag">Arquitectura Multi-Inquilino (Multi-Tenant)</div>
        <div class="feature-tag">Control de Acceso basado en Roles (RBAC)</div>
        <div class="feature-tag">Catálogo de Productos y Categorías</div>
        <div class="feature-tag">Cuentas Contables PUC Integradas</div>
        <div class="feature-tag">Especialistas de Servicio y Mesas</div>
        <div class="feature-tag">Control de Inquilinos y Terceros</div>
      </div>

      <a href="/api-docs" class="btn-docs">Explorar Documentación Interactiva (Swagger)</a>
    </div>
  </main>

  <footer>
    <p class="copyright">
      COPYRIGHT &copy; 2026 <a href="https://cinndev.com" target="_blank" class="owner-brand">Cinndev SAS</a>. TODOS LOS DERECHOS RESERVADOS.<br>
      Desarrollado y operado con fines empresariales por Cinndev.
    </p>
  </footer>
</body>
</html>
  `);
});

// Swagger UI Route
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Healthy check route
app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'success',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    app: 'Kaybiz API',
  });
});

// Mount V1 API Routes
app.use('/api/v1', apiRouter);

// Fallback Route (404 Not Found)
app.use('*', (_req, _res, next) => {
  next(new NotFoundError(`Resource not found: ${_req.originalUrl}`));
});

// Central Error Handler
app.use(errorHandler);

export default app;
