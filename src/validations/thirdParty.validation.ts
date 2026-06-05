import Joi from 'joi';

const sanitizeString = (val: string) => {
  if (typeof val !== 'string') return val;
  // Retain alphanumeric characters, standard Spanish letters, spaces, and punctuation (. , # -)
  return val.replace(/[^a-zA-Z0-9áéíóúñÁÉÍÓÚÑüÜ\s#.,-]/g, '').trim();
};

export const createThirdPartySchema = Joi.object({
  isClient: Joi.boolean().default(false),
  isProvider: Joi.boolean().default(false),
  isEmployee: Joi.boolean().default(false),
  documentType: Joi.string().valid('NIT', 'CC', 'CE', 'RUT', 'PP').required().messages({
    'any.required': 'documentType is required',
    'any.only': 'documentType must be one of [NIT, CC, CE, RUT, PP]',
  }),
  documentNumber: Joi.string().max(30).required().messages({
    'any.required': 'documentNumber is required',
  }),
  verificationDigit: Joi.string().length(1).allow(null, '').optional(),
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
  stateDepartment: Joi.string().required().messages({
    'any.required': 'stateDepartment (department) is required',
  }),
  city: Joi.string().required().messages({
    'any.required': 'city is required',
  }),
  address: Joi.string().required().messages({
    'any.required': 'address is required',
  }),
}).custom((value, helpers) => {
  // 1. Enforce at least one flag is true
  if (!value.isClient && !value.isProvider && !value.isEmployee) {
    return helpers.message({ custom: 'At least one of [isClient, isProvider, isEmployee] must be set to true' });
  }

  // 2. NIT conditional validation
  if (value.documentType === 'NIT') {
    if (!value.companyName || value.companyName.trim() === '') {
      return helpers.message({ custom: 'companyName is mandatory when documentType is NIT' });
    }
    if (!value.verificationDigit || !/^[0-9]$/.test(value.verificationDigit)) {
      return helpers.message({ custom: 'verificationDigit is mandatory and must be a single digit (0-9) when documentType is NIT' });
    }
  }

  // 3. Sanitizations
  if (value.firstName) value.firstName = sanitizeString(value.firstName);
  if (value.lastName) value.lastName = sanitizeString(value.lastName);
  if (value.companyName) value.companyName = sanitizeString(value.companyName);
  if (value.address) value.address = sanitizeString(value.address);

  return value;
});

export const updateThirdPartySchema = Joi.object({
  isClient: Joi.boolean(),
  isProvider: Joi.boolean(),
  isEmployee: Joi.boolean(),
  documentType: Joi.string().valid('NIT', 'CC', 'CE', 'RUT', 'PP'),
  documentNumber: Joi.string().max(30),
  verificationDigit: Joi.string().length(1).allow(null, ''),
  companyName: Joi.string().allow(null, ''),
  firstName: Joi.string().allow(null, ''),
  lastName: Joi.string().allow(null, ''),
  email: Joi.string().email(),
  phone: Joi.string(),
  stateDepartment: Joi.string(),
  city: Joi.string(),
  address: Joi.string(),
  isActive: Joi.boolean(),
}).custom((value) => {
  // Apply sanitizations if present
  if (value.firstName) value.firstName = sanitizeString(value.firstName);
  if (value.lastName) value.lastName = sanitizeString(value.lastName);
  if (value.companyName) value.companyName = sanitizeString(value.companyName);
  if (value.address) value.address = sanitizeString(value.address);
  return value;
});
