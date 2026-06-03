import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import apiRouter from './routes';
import { errorHandler } from './middlewares/error.middleware';
import { NotFoundError } from './utils/errors';

const app = express();

// Security Middlewares
app.use(helmet());
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
