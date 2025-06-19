const Joi = require('joi');

const createLeaveTypeSchema = Joi.object({
  name: Joi.string().empty('').empty(null).required(),

  description: Joi.string().empty('').empty(null).required(),
  yearAccrual: Joi.bool().empty('').empty(null).required(),
  monthAccrual: Joi.bool().empty('').empty(null).required()
});

const leaveTypeIdSchema = Joi.object({
  leaveTypeID: Joi.number().integer().min(1).empty('').empty(null).required(),
});

module.exports = {
  createLeaveTypeSchema,
  leaveTypeIdSchema,
};
