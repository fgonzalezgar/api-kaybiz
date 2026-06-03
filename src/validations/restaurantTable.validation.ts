import Joi from 'joi';

export const createRestaurantTableSchema = Joi.object({
  branchId: Joi.string().uuid().required().messages({
    'any.required': 'branchId is required',
    'string.uuid': 'branchId must be a valid UUID',
  }),
  tableCode: Joi.string().max(20).required().messages({
    'any.required': 'tableCode is required',
    'string.max': 'tableCode cannot exceed 20 characters',
  }),
  status: Joi.string().valid('available', 'occupied', 'reserved').default('available').messages({
    'any.only': 'status must be one of [available, occupied, reserved]',
  }),
});

export const updateRestaurantTableSchema = Joi.object({
  branchId: Joi.string().uuid().messages({
    'string.uuid': 'branchId must be a valid UUID',
  }),
  tableCode: Joi.string().max(20).messages({
    'string.max': 'tableCode cannot exceed 20 characters',
  }),
  status: Joi.string().valid('available', 'occupied', 'reserved').messages({
    'any.only': 'status must be one of [available, occupied, reserved]',
  }),
});
