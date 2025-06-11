const Joi = require('joi');

const createpasswordSchema = Joi.object({
  id: Joi.number().integer().required(),

  email: Joi.string().email().required(),

  encryptedPassword: Joi.string().required(),

});

const adminLoginSchema = Joi.object({
  role : Joi.string().required(),
});

const employeeLoginSchema = Joi.object({

  email: Joi.string().email().required(),

  encryptedPassword: Joi.string().required()
});

module.exports = {
    createpasswordSchema,
  employeeLoginSchema,
  adminLoginSchema,
};
