const Joi = require('joi');

const createDesignationSchema = Joi.object({
  name: Joi.string().required(),

  description: Joi.string().required(),
});


const designationIdSchema = Joi.object({
  DesignationID: Joi.number().integer().required(),
});

module.exports = {
  createDesignationSchema,
  designationIdSchema,
};
