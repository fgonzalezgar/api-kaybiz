import Joi from 'joi';

export const createTenantSchema = Joi.object({
  businessName: Joi.string().required().messages({
    'any.required': 'businessName is required',
  }),
  nit: Joi.string().required().messages({
    'any.required': 'nit (Tax ID) is required',
  }),
  dv: Joi.string().max(2).required().messages({
    'any.required': 'dv (verification digit) is required',
  }),
  fiscalRegimen: Joi.string().optional(),
  city: Joi.string().optional(),
  address: Joi.string().optional(),
  phone: Joi.string().required().messages({
    'any.required': 'phone is required',
  }),
  businessType: Joi.string().valid('generic', 'restaurant', 'drugstore', 'supermarket', 'salon', 'hardware_store').default('generic').messages({
    'any.only': 'businessType must be one of [generic, restaurant, drugstore, supermarket, salon, hardware_store]',
  }),
});

export const updateTenantSchema = Joi.object({
  businessName: Joi.string(),
  nit: Joi.string(),
  dv: Joi.string().max(2),
  fiscalRegimen: Joi.string().allow(null, ''),
  city: Joi.string().allow(null, ''),
  address: Joi.string().allow(null, ''),
  phone: Joi.string(),
  businessType: Joi.string().valid('generic', 'restaurant', 'drugstore', 'supermarket', 'salon', 'hardware_store').messages({
    'any.only': 'businessType must be one of [generic, restaurant, drugstore, supermarket, salon, hardware_store]',
  }),
});
