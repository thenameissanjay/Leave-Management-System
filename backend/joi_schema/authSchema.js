const Joi = require('joi');

const createpasswordSchema = Joi.object({
  id: Joi.number().integer().min(1).empty('').empty(null).required(),

  email: Joi.string().email().empty('').empty(null).required(),

  encryptedPassword: Joi.string().empty('').empty(null).required(),

});

const adminLoginSchema = Joi.object({
  email: Joi.string().email().empty('').empty(null).required(),
  encryptedPassword : Joi.string().empty('').empty(null).required()
});

const employeeLoginSchema = Joi.object({

  email: Joi.string().email().empty('').empty(null).required(),

  encryptedPassword: Joi.string().empty('').empty(null).required()
});

module.exports = {
    createpasswordSchema,
  employeeLoginSchema,
  adminLoginSchema,
};
