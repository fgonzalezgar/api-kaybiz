import Joi from 'joi';

export const createBrandSchema = Joi.object({
  name: Joi.string().required().messages({
    'any.required': 'Brand name is required',
  }),
});

export const updateBrandSchema = Joi.object({
  name: Joi.string().required().messages({
    'any.required': 'Brand name is required',
  }),
});
