const Joi = require('joi');

const updateLeavePolicySchema = Joi.array().items(
  Joi.object({
    designation_id: Joi.number().integer().min(1).empty('').empty(null).required(),
    leaves: Joi.array()
      .items(
        Joi.object({
          leave_type_id: Joi.number().integer().min(1).empty('').empty(null).required(),
          value: Joi.number().integer().empty('').empty(null).required(),
          max: Joi.number().integer().empty('').empty(null).required(),
        })
      )
      .required(),
  })
);

module.exports = {
  updateLeavePolicySchema,
};
