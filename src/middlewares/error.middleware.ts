import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
) => {
  // If it's a known operational app error
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
    });
  }

  // Handle Sequelize validation errors
  if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
    const messages = (err as any).errors.map((e: any) => e.message);
    return res.status(400).json({
      status: 'error',
      message: 'Validation Error',
      errors: messages,
    });
  }

  // Handle JSON parsing syntax errors
  if (err instanceof SyntaxError && 'status' in err && (err as any).status === 400 && 'body' in err) {
    return res.status(400).json({
      status: 'error',
      message: 'Invalid JSON payload format',
    });
  }

  // Log unhandled server errors
  console.error('UNHANDLED ERROR:', err);

  const response: { status: string; message: string; stack?: string } = {
    status: 'error',
    message: 'Internal Server Error',
  };

  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
    response.message = err.message;
  }

  return res.status(500).json(response);
};
