import Joi from 'joi';

export const createAccountingAccountSchema = Joi.object({
  code: Joi.string().required().messages({
    'any.required': 'code is required',
  }),
  name: Joi.string().required().messages({
    'any.required': 'name is required',
  }),
  type: Joi.string().valid('Asset', 'Liability', 'Equity', 'Revenue', 'Expense').required().messages({
    'any.required': 'type is required',
    'any.only': 'type must be one of [Asset, Liability, Equity, Revenue, Expense]',
  }),
  level: Joi.number().integer().min(1).max(4).required().messages({
    'any.required': 'level is required',
    'number.min': 'level must be at least 1 (Class)',
    'number.max': 'level must be at most 4 (Sub-account)',
  }),
  allowsMovement: Joi.boolean().default(true),
  requiresCostCenter: Joi.boolean().default(false),
});

export const updateAccountingAccountSchema = Joi.object({
  code: Joi.string(),
  name: Joi.string(),
  type: Joi.string().valid('Asset', 'Liability', 'Equity', 'Revenue', 'Expense'),
  level: Joi.number().integer().min(1).max(4),
  allowsMovement: Joi.boolean(),
  requiresCostCenter: Joi.boolean(),
});
