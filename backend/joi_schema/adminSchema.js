const Joi = require('joi');

const createEmployeeSchema = Joi.object({
  name: Joi.string().empty('').empty(null).required(),

  email: Joi.string().email().empty('').empty(null).required(),

  phone: Joi.number().integer().min(1000000000).max(9999999999).empty('').empty(null).required(),

  designation: Joi.number().integer().allow(null).empty('').required(),

  reporting_to: Joi.number().integer().allow(null).empty('').required(),

  date_of_joining: Joi.string()
    .pattern(/^\d{4}-\d{2}-\d{2}$/)
    .empty('')
    .required(),
});

const employeeIdSchema = Joi.object({
  EmployeeID: Joi.number().integer().min(1).empty('').empty(null).required(),
});


const reportingIdSchema = Joi.object({
  ReportingManagerID: Joi.number().integer().min(1).empty('').empty(null).required(),
});

const updateEmployeeSchema = Joi.object({

  employee_id: Joi.number().integer().min(1).empty('').empty(null),

  name: Joi.string().empty(null).empty('').required(),

  email: Joi.string().email().empty(null).empty('').required(),

  phone: Joi.number().integer().min(1000000000).max(9999999999).empty(null).empty('').required(),

  designation: Joi.number().integer().min(1).allow(null).empty('').required(),

  reporting_to: Joi.number().integer().min(1).allow(null).empty('').required(),

  date_of_joining: Joi.string()
    .pattern(/^\d{4}-\d{2}-\d{2}$/)
    .empty('')
    .required(),
});

module.exports = {
  createEmployeeSchema,
  employeeIdSchema,
  updateEmployeeSchema,
  reportingIdSchema,
  
};
