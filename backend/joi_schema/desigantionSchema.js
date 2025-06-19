const Joi = require('joi');

const createDesignationSchema = Joi.object({
  name: Joi.string().empty('').empty(null).required(),

  description: Joi.string().empty('').empty(null).required(),
});


const designationIdSchema = Joi.object({
  DesignationID: Joi.number().integer().min(1).empty('').empty(null).required(),
});

module.exports = {
  createDesignationSchema,
  designationIdSchema,
};
