import Joi from 'joi';

export const registerSchema = Joi.object({
  tenant: Joi.object({
    businessName: Joi.string().required().messages({
      'any.required': 'businessName is required',
    }),
    nit: Joi.string().required().messages({
      'any.required': 'nit (Tax ID) is required',
    }),
    dv: Joi.string().max(2).required().messages({
      'any.required': 'dv (verification digit) is required',
    }),
    fiscalRegimen: Joi.string().required().messages({
      'any.required': 'fiscalRegimen is required',
    }),
    city: Joi.string().required().messages({
      'any.required': 'city is required',
    }),
    address: Joi.string().required().messages({
      'any.required': 'address is required',
    }),
    phone: Joi.string().required().messages({
      'any.required': 'phone is required',
    }),
    businessType: Joi.string().valid('generic', 'restaurant', 'drugstore', 'supermarket', 'salon', 'hardware_store').default('generic').messages({
      'any.only': 'businessType must be one of [generic, restaurant, drugstore, supermarket, salon, hardware_store]',
    }),
  }).required(),
  admin: Joi.object({
    name: Joi.string().required().messages({
      'any.required': 'admin name is required',
    }),
    email: Joi.string().email().required().messages({
      'any.required': 'admin email is required',
      'string.email': 'admin email must be a valid email',
    }),
    password: Joi.string().min(6).required().messages({
      'any.required': 'admin password is required',
      'string.min': 'admin password must be at least 6 characters long',
    }),
  }).required(),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'any.required': 'email is required',
    'string.email': 'must be a valid email address',
  }),
  password: Joi.string().required().messages({
    'any.required': 'password is required',
  }),
});
