const Joi = require('joi');

const createLeaveTypeSchema = Joi.object({
  name: Joi.string().required(),

  description: Joi.string().required(),
  yearAccrual: Joi.bool().required(),
  monthAccrual: Joi.bool().required()
});

const leaveTypeIdSchema = Joi.object({
  leaveTypeID: Joi.number().integer().required(),
});

module.exports = {
  createLeaveTypeSchema,
  leaveTypeIdSchema,
};
