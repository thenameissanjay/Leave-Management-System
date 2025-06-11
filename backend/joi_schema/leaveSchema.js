const Joi = require('joi');

const createRequestSchema = Joi.object({
    employee_id: Joi.number().integer().required(),

    leaveType: Joi.number().integer().required(),

    fromDate: Joi.date().iso().required(),

    toDate: Joi.date().iso().required(),

    reason: Joi.string().required(),

    leaveCount: Joi.number().integer().required(),

    designation: Joi.number().integer().required(),

    requestAt: Joi.string().required(),

});

const incomingLeaveSchema = Joi.object({
  EmployeeID: Joi.number().integer().required(),
  role: Joi.number().integer().required(),

});

// const reportingIdSchema = Joi.object({
//   ReportingManagerID: Joi.number().integer().required(),
// });

const approveLeaveSchema = Joi.object({

    request_id: Joi.number().integer().required(),

    approver_id: Joi.number().integer().required(),

    status: Joi.string().required(),

    approvedAt: Joi.date().iso().required(),

    comments: Joi.string().allow(''),

    role: Joi.number().integer().required(),
});

module.exports = {
    createRequestSchema,
    incomingLeaveSchema,
    approveLeaveSchema
};
