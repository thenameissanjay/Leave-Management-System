const Joi = require('joi');

const createRequestSchema = Joi.object({
  employee_id: Joi.number().integer().min(1).required(),

  leaveType: Joi.number().integer().min(1).required(),

  fromDate: Joi.string()
    .pattern(/^\d{4}-\d{2}-\d{2}$/)
    .empty('')
    .required(),

  toDate: Joi.string()
    .pattern(/^\d{4}-\d{2}-\d{2}$/)
    .empty('')
    .required(),

  reason: Joi.string().max(100).empty('').required(),
  leaveCount: Joi.number().integer().min(1).required(),
  designation: Joi.number().integer().min(1).required(),
  requestAt: Joi.string().isoDate().empty('').required(),
}).strict();

const incomingLeaveSchema = Joi.object({
  EmployeeID: Joi.number().integer().min(1).empty('').empty(null).required(),
  role: Joi.number().integer().min(1).empty('').empty(null).required(),
  offset: Joi.number().integer().min(0).empty('').empty(null).required(),
  limit: Joi.number().integer().min(0).empty('').empty(null).required(),
});

// const reportingIdSchema = Joi.object({
//   ReportingManagerID: Joi.number().integer().required(),
// });

const approveLeaveSchema = Joi.object({
  request_id: Joi.number().integer().min(1).empty('').empty(null).required(),

  approver_id: Joi.number().integer().min(1).empty('').empty(null).required(),

  status: Joi.string().empty('').empty(null).required(),

  approvedAt: Joi.string().isoDate().empty('').required(),

  comments: Joi.string().allow('').required(),

  role: Joi.number().integer().min(1).empty('').empty(null).required(),
});

const offsetLimit = Joi.object({
  offset: Joi.number().integer().min(0).empty('').empty(null).required(),
  limit: Joi.number().integer().min(1).empty('').empty(null).required(),
});

module.exports = {
  createRequestSchema,
  incomingLeaveSchema,
  approveLeaveSchema,
  offsetLimit,
};
