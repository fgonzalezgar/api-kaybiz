import Joi from 'joi';

export const createServiceSpecialistSchema = Joi.object({
  userId: Joi.string().uuid().required().messages({
    'any.required': 'userId is required',
    'string.uuid': 'userId must be a valid UUID',
  }),
  commissionPercentage: Joi.number().min(0).max(100).required().messages({
    'any.required': 'commissionPercentage is required',
    'number.min': 'commissionPercentage cannot be less than 0.00',
    'number.max': 'commissionPercentage cannot exceed 100.00',
  }),
});

export const updateServiceSpecialistSchema = Joi.object({
  userId: Joi.string().uuid().messages({
    'string.uuid': 'userId must be a valid UUID',
  }),
  commissionPercentage: Joi.number().min(0).max(100).messages({
    'number.min': 'commissionPercentage cannot be less than 0.00',
    'number.max': 'commissionPercentage cannot exceed 100.00',
  }),
});
