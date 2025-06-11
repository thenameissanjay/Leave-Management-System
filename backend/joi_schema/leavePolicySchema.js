const Joi = require('joi');

const updateLeavePolicySchema = Joi.array().items(
  Joi.object({
    designation_id: Joi.number().integer().required(),
    leaves: Joi.array()
      .items(
        Joi.object({
          leave_type_id: Joi.number().integer().required(),
          value: Joi.number().integer().required(),
          max: Joi.number().integer().required(),
        })
      )
      .required(),
  })
);

module.exports = {
  updateLeavePolicySchema,
};
