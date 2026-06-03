import Joi from 'joi';

export const createProductSchema = Joi.object({
  categoryId: Joi.string().uuid().required().messages({
    'any.required': 'categoryId is required',
    'string.uuid': 'categoryId must be a valid UUID',
  }),
  brandId: Joi.string().uuid().required().messages({
    'any.required': 'brandId is required',
    'string.uuid': 'brandId must be a valid UUID',
  }),
  name: Joi.string().required().messages({
    'any.required': 'Product name is required',
  }),
  skuBarcode: Joi.string().required().messages({
    'any.required': 'skuBarcode is required',
  }),
  type: Joi.string().valid('product', 'service').required().messages({
    'any.required': 'type is required',
    'any.only': 'type must be either product or service',
  }),
  cost: Joi.number().min(0).required().messages({
    'any.required': 'cost is required',
    'number.min': 'cost cannot be less than 0',
  }),
  price: Joi.number().min(0).required().messages({
    'any.required': 'price is required',
    'number.min': 'price cannot be less than 0',
  }),
  taxPercentage: Joi.number().valid(0, 5, 19).required().messages({
    'any.required': 'taxPercentage is required',
    'any.only': 'taxPercentage must be one of [0, 5, 19]',
  }),
  accountingAccountRevenueId: Joi.string().uuid().required().messages({
    'any.required': 'accountingAccountRevenueId is required',
    'string.uuid': 'accountingAccountRevenueId must be a valid UUID',
  }),
  accountingAccountExpenseId: Joi.string().uuid().required().messages({
    'any.required': 'accountingAccountExpenseId is required',
    'string.uuid': 'accountingAccountExpenseId must be a valid UUID',
  }),
  requiresExpirationControl: Joi.boolean().default(false).optional(),
  batchNumber: Joi.string().max(50).allow(null, '').optional(),
  isRecipePrepared: Joi.boolean().default(false).optional(),
});

export const updateProductSchema = Joi.object({
  categoryId: Joi.string().uuid().messages({
    'string.uuid': 'categoryId must be a valid UUID',
  }),
  brandId: Joi.string().uuid().messages({
    'string.uuid': 'brandId must be a valid UUID',
  }),
  name: Joi.string(),
  skuBarcode: Joi.string(),
  type: Joi.string().valid('product', 'service'),
  cost: Joi.number().min(0),
  price: Joi.number().min(0),
  taxPercentage: Joi.number().valid(0, 5, 19),
  accountingAccountRevenueId: Joi.string().uuid().messages({
    'string.uuid': 'accountingAccountRevenueId must be a valid UUID',
  }),
  accountingAccountExpenseId: Joi.string().uuid().messages({
    'string.uuid': 'accountingAccountExpenseId must be a valid UUID',
  }),
  requiresExpirationControl: Joi.boolean().optional(),
  batchNumber: Joi.string().max(50).allow(null, '').optional(),
  isRecipePrepared: Joi.boolean().optional(),
});
