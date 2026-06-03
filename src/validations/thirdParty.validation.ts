import Joi from 'joi';

export const createThirdPartySchema = Joi.object({
  isClient: Joi.boolean().default(false),
  isProvider: Joi.boolean().default(false),
  documentType: Joi.string().valid('NIT', 'CC', 'CE', 'RUT').required().messages({
    'any.required': 'documentType is required',
    'any.only': 'documentType must be one of [NIT, CC, CE, RUT]',
  }),
  documentNumber: Joi.string().required().messages({
    'any.required': 'documentNumber is required',
  }),
  verificationDigit: Joi.string().max(2).allow(null, '').optional(),
  companyName: Joi.string().allow(null, '').optional(),
  firstName: Joi.string().allow(null, '').optional(),
  lastName: Joi.string().allow(null, '').optional(),
  email: Joi.string().email().required().messages({
    'any.required': 'email is required',
    'string.email': 'must be a valid email',
  }),
  phone: Joi.string().required().messages({
    'any.required': 'phone is required',
  }),
  address: Joi.string().required().messages({
    'any.required': 'address is required',
  }),
  city: Joi.string().required().messages({
    'any.required': 'city is required',
  }),
}).custom((value, helpers) => {
  if (!value.isClient && !value.isProvider) {
    return helpers.message({ custom: 'At least one of [isClient, isProvider] must be set to true' });
  }
  return value;
});

export const updateThirdPartySchema = Joi.object({
  isClient: Joi.boolean(),
  isProvider: Joi.boolean(),
  documentType: Joi.string().valid('NIT', 'CC', 'CE', 'RUT'),
  documentNumber: Joi.string(),
  verificationDigit: Joi.string().max(2).allow(null, ''),
  companyName: Joi.string().allow(null, ''),
  firstName: Joi.string().allow(null, ''),
  lastName: Joi.string().allow(null, ''),
  email: Joi.string().email(),
  phone: Joi.string(),
  address: Joi.string(),
  city: Joi.string(),
}); // In updates, the service layer double-checks that the final combined result doesn't violate both false.
