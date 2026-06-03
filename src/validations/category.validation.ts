import Joi from 'joi';

export const createCategorySchema = Joi.object({
  name: Joi.string().required().messages({
    'any.required': 'Category name is required',
  }),
  slug: Joi.string().required().messages({
    'any.required': 'Category slug is required',
  }),
  parentId: Joi.string().uuid().allow(null, '').optional().messages({
    'string.uuid': 'parentId must be a valid UUID',
  }),
});

export const updateCategorySchema = Joi.object({
  name: Joi.string(),
  slug: Joi.string(),
  parentId: Joi.string().uuid().allow(null, '').optional().messages({
    'string.uuid': 'parentId must be a valid UUID',
  }),
});
