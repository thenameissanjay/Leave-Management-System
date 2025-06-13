const Joi = require('joi');

const createEmployeeSchema = Joi.object({
  name: Joi.string().required(),

  email: Joi.string().email().required(),

  phone: Joi.number().integer().min(1000000000).max(9999999999).required(),

  designation: Joi.number().integer().required(),

  reporting_to: Joi.number().integer().required(),

  date_of_joining: Joi.date().iso().required(),

  password: Joi.string().allow(''),
});

const employeeIdSchema = Joi.object({
  EmployeeID: Joi.number().integer().required(),
});


const reportingIdSchema = Joi.object({
  ReportingManagerID: Joi.number().integer().required(),
});

const updateEmployeeSchema = Joi.object({

  employee_id: Joi.number().integer(),

  name: Joi.string().required(),

  email: Joi.string().email().required(),

  phone: Joi.number().integer().min(1000000000).max(9999999999).required(),

  designation: Joi.number().integer().required(),

  reporting_to: Joi.number().integer().required(),

  date_of_joining: Joi.date().iso().required(),

  password: Joi.string().allow('')
});

module.exports = {
  createEmployeeSchema,
  employeeIdSchema,
  updateEmployeeSchema,
  reportingIdSchema,
  
};
