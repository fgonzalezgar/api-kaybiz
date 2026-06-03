import { Request, Response, NextFunction } from 'express';
import { Schema } from 'joi';
import { BadRequestError } from '../utils/errors';

export const validateSchema = (schema: Schema, property: 'body' | 'query' | 'params' = 'body') => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      allowUnknown: false,
      stripUnknown: true,
    });

    if (error) {
      const details = error.details.map((d) => d.message).join(', ');
      return next(new BadRequestError(`Validation error: ${details}`));
    }

    req[property] = value;
    return next();
  };
};
